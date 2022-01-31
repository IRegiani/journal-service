// Both functions that receives index had it already checked out in the controller
/* eslint-disable security/detect-object-injection */
const { differenceInSeconds } = require('date-fns');

const { createHash, getObjectValuesByKeys } = require('../utils/utils');
const { MAX_JOURNAL_UPDATE_TIMEOUT, CUSTOM_RESPONSES } = require('../utils/constants');
const { CustomError } = require('../utils/error')();
const logger = require('../utils/logger').initLogger({ name: 'ENTRY SERVICE' });

module.exports = (options) => {
    const tagService = require('./tagService')(options);
    const journalService = require('./journalService')(options);
    const fileService = require('./fileService')(options);

    const getHashForEntry = (entry) => createHash(`${entry.description}${entry.fileUids}${entry.createdAt}`);

    const addAttachment = async (index, journal, file) => {
        const updatedEntry = { ...journal.entries[index] };
        if (updatedEntry.fileUids) updatedEntry.fileUids.push(file.uid);
        else updatedEntry.fileUids = [file.uid];

        const { description, fileUids, createdAt } = updatedEntry;
        updatedEntry.hash = createHash(`${description}${fileUids}${createdAt}`);

        await journalService.updateEntry(index, journal.uid, updatedEntry, file);
        logger.info('Attachment added to entry', index);

        return updatedEntry;
    };

    const createEntry = (currentDate = new Date().toISOString(), description, entryTags, fileUid, fileEntry) => {
        const tags = tagService.getValidatedEntryTags([], entryTags);

        if (!description && !fileUid) return undefined;

        const entry = {
            // TODO: device
            description,
            createdAt: currentDate,
            fileUids: fileUid && [fileUid],
            fileEntry: fileEntry ? fileUid : undefined,
            tags,
        };
        entry.hash = getHashForEntry(entry);

        return entry;
    };

    const createAndSaveEntry = async (journal, description, file, fileEntry, tags) => {
        const dateDiff = differenceInSeconds(new Date(file?.createdAt || new Date()), new Date(journal.createdAt));
        const willReceiveNewDate = dateDiff > MAX_JOURNAL_UPDATE_TIMEOUT || journal.entries.length > 0;
        const date = willReceiveNewDate ? undefined : journal.createdAt;

        logger.debug(`Creating entry to journal ${journal.uid} ${willReceiveNewDate ? 'with new date' : `dating ${journal.createdAt}`}`);

        const newEntry = createEntry(date, description, tags, file?.uid, fileEntry);
        await journalService.addEntry(journal.uid, newEntry);

        return newEntry;
    };

    const validate = (entries = []) => {
        logger.debug(`Validating ${entries.length} entries`);
        const hasInvalidEntry = entries.some((entry) => entry.hash !== getHashForEntry(entry));
        if (hasInvalidEntry) throw new CustomError('Entry has been modified/replaced', CUSTOM_RESPONSES.CODES.hashValidation);
    };

    const retrieveEntriesDetails = async (entries) => {
        validate(entries);

        const fileUids = entries.filter((entry) => entry.fileUids).map((ety) => ety.fileUids).flat();
        // it's an array of entries, with an array of fileUids. Beware, not all entry has a file
        const fileList = await Promise.all(fileUids.map(fileService.retrieveFileDetails));

        const fileKeys = ['uid', 'size', 'type', 'createdAt', 'originalDate'];
        const filesWithUid = fileList.reduce((obj, file) => ({ ...obj, [file.uid]: getObjectValuesByKeys(file, fileKeys) }), {});

        return entries.map(({ createdAt, tags, hash, description, fileEntry }, index) => ({
            description,
            createdAt,
            files: entries[index].fileUids && getObjectValuesByKeys(filesWithUid, entries[index].fileUids),
            fileEntry,
            tags,
            hash,
        }));
    };

    const updateEntryTags = async (index, journal, tags) => {
        const entry = journal.entries[index];
        validate([entry]);

        const currentTags = entry.tags;

        const updatedTags = tagService.getValidatedEntryTags(currentTags, tags);
        const newEntry = { ...entry, tags: updatedTags };

        const updatedJournal = await journalService.updateEntry(index, journal.uid, newEntry);

        return updatedJournal.entries[index];
    };

    return {
        validate,
        createEntry,
        createAndSaveEntry,
        retrieveEntriesDetails,
        addAttachment,
        updateEntryTags,
    };
};
