const { differenceInSeconds } = require('date-fns');
const { StatusCodes } = require('http-status-codes');

const { createHash, getObjectKeys } = require('../utils/utils');
const logger = require('../utils/logger').initLogger({ name: 'ENTRY SERVICE' });
const { MAX_JOURNAL_UPDATE_TIMEOUT } = require('../utils/constants');
const { CustomError } = require('../utils/error')();

module.exports = (options) => {
  const tagService = require('./tagService')(options);
  const journalService = require('./journalService')(options);
  const fileService = require('./fileService')(options);

  // const updateEntry = async () => {};

  const createEntry = async (currentDate = new Date().toISOString(), description, entryTags = [], fileUid, fileEntry) => {
    const tags = await tagService.addEntryTags(entryTags);

    if (!description && !fileUid) return undefined;

    return {
      // TODO: device
      description,
      createdAt: currentDate,
      fileUids: fileUid && [fileUid],
      fileEntry: fileEntry && fileUid,
      tags,
      hash: createHash(`${description}${fileUid}${currentDate}`),
    };
  };

  const createAndSaveEntry = async (journal, description, file, fileEntry, tags) => {
    const dateDiff = differenceInSeconds(new Date(file?.createdAt || new Date()), new Date(journal.createdAt));
    const willReceiveNewDate = dateDiff > MAX_JOURNAL_UPDATE_TIMEOUT || journal.entries.length > 0;
    const date = willReceiveNewDate ? undefined : journal.createdAt;

    logger.debug(`Creating entry to journal ${journal.uid} ${willReceiveNewDate ? 'with new date' : `dating ${journal.createdAt}`}`);

    const newEntry = await createEntry(date, description, tags, file?.uid, fileEntry);
    const updatedJournal = await journalService.addEntry(journal.uid, newEntry);

    return updatedJournal;
  };

  const retrieveEntriesDetails = async (entries) => {
    const hashes = entries.map(({ description, fileUids, createdAt }) => createHash(`${description}${fileUids}${createdAt}`));

    logger.debug(`Validating ${entries.length} entries`);
    if (!entries.every((entry) => hashes.includes(entry.hash))) throw new CustomError('Entry has been modified/replaced', StatusCodes.INTERNAL_SERVER_ERROR);

    const fileUids = entries.filter((entry) => entry.fileUids).map((ety) => ety.fileUids).flat();
    // it's an array entries, with an array of files. Beware, not all entry has a file
    const fileList = await Promise.all(fileUids.map(fileService.retrieveFileDetails));

    const fileKeys = ['uid', 'size', 'type', 'createdAt'];
    const filesWithUid = fileList.reduce((obj, file) => ({ ...obj, [file.uid]: getObjectKeys(fileKeys, file) }), {});

    return entries.map(({ createdAt, tags, hash, description, fileEntry }, index) => ({
      description,
      createdAt,
      files: entries[index].fileUids && getObjectKeys(entries[index].fileUids, filesWithUid),
      fileEntry,
      tags,
      hash,
    }));
  };

  return {
    createEntry,
    createAndSaveEntry,
    retrieveEntriesDetails,
  };
};
