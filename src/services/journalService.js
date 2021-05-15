/* eslint-disable security/detect-object-injection */
const { v4: generateUid } = require('uuid');
const { StatusCodes } = require('http-status-codes');
const { differenceInSeconds } = require('date-fns');

const logger = require('../utils/logger').initLogger({ name: 'JOURNAL SERVICE' });
const { CustomError } = require('../utils/error')();
const { MAX_JOURNAL_UPDATE_TIMEOUT, UPDATE_TYPES, TAG_TYPES } = require('../utils/constants');
const { addNewItemOrCreateArray } = require('../utils/utils');

module.exports = ({ db }) => {
  const tagService = require('./tagService')({ db });

  const getJournal = (uid) => {
    const journal = db.get('journals').value().find((jrl) => jrl.uid === uid);
    if (!journal) throw new CustomError(`Journal ${uid} not found`, StatusCodes.NOT_FOUND);
    return journal;
  };

  const getJournalsByTag = (tag) => db.get('journals').value().filter((journal) => journal.tags?.includes(tag));

  const getJournalsByEntriesTag = (tag) => db.get('journals').value().filter(
    (journal) => journal.entries?.some((entry) => entry?.tags?.includes(tag)),
  );

  // WIP: journalsUidsToUpdate could be removed
  const _updateEntryOrJournalsByTag = async (journalsUidsToUpdate, tag, tagType, updateFunc, updateHistory) => {
    const allJournals = db.get('journals').value();
    const result = { uids: [], entries: [] };

    allJournals.forEach((journal, journalIndex) => {
      if (journalsUidsToUpdate.includes(journal.uid)) {
        const updatedIndexes = [];
        const journalTagIndex = journal.tags?.indexOf(tag);
        if (journalTagIndex && tagType === TAG_TYPES.journal) {
          allJournals[journalIndex].tags = updateFunc(allJournals[journalIndex].tags);
          logger.info('Updated tag on journal', { uid: journal.uid });
          result.uids.push(journal.uid);
        }

        journal.entries.forEach((entry, index) => {
          const entryTagIndex = entry?.tags.indexOf(tag);
          if (entryTagIndex && tagType === TAG_TYPES.entry) {
            updatedIndexes.push(index);
            allJournals[journalIndex].entries[index] = updateFunc(allJournals[journalIndex].entries[index]);
          }
        });

        if (updateHistory) allJournals[journalIndex].updateHistory = addNewItemOrCreateArray(journal.updateHistory, updateHistory(updatedIndexes));

        if (updatedIndexes.length > 0 && tagType === TAG_TYPES.entry) {
          logger.info(`Updated entry(ies) ${updatedIndexes} on journal`, { uid: journal.uid });
          result.uid.push(journal.uid);
          result.entries.push(updatedIndexes);
        }
      }
    });

    await db.get('journals').set(allJournals).save();

    return result;
  };

  const _getUpdatedUidsAndEntriesFormatted = ({ uids, entries }) => uids.reduce((acc, uid, index) => ({ ...acc, [uid]: entries[index] }), {});

  const addEntryJournalHistory = (journal, entry) => {
    const fileUid = entry?.fileUids && entry.fileUids.length === 1 && entry.fileUids[0];
    const fileDate = fileUid ? db.get('files').get(fileUid).value().createdAt : undefined;

    const diff = differenceInSeconds(new Date(fileDate || entry.createdAt), new Date(journal.createdAt));
    const willAddUpdateEntry = diff > MAX_JOURNAL_UPDATE_TIMEOUT || journal.entries.length > 0;

    if (!willAddUpdateEntry) return null;

    return { type: UPDATE_TYPES.addedEntry, at: entry.createdAt };
  };

  const addEntry = async (uid, newEntry) => {
    const journal = getJournal(uid);

    const history = addEntryJournalHistory(journal, newEntry);

    journal.entries = addNewItemOrCreateArray(journal.entries, newEntry);
    if (history) journal.updateHistory = addNewItemOrCreateArray(journal.updateHistory, history);

    logger.info(`New entry added to Journal, ${history ? 'history updated' : 'history update skipped'}`);

    await db.save();
    return journal;
  };

  const updateEntry = async (index, uid, entry, file) => {
    const journal = getJournal(uid);

    const history = {
      type: file ? UPDATE_TYPES.addedFile : UPDATE_TYPES.modifiedTag,
      at: file?.createdAt || new Date().toISOString(),
      relatedUid: file && file.uid,
      relatedIndex: index,
    };

    journal.entries[index] = entry;
    journal.updateHistory = addNewItemOrCreateArray(journal.updateHistory, history);
    await db.save();

    logger.info(`Updated entry ${index} in journal`, { uid, index });

    return journal;
  };

  const updateTagFromEntriesAndJournalsBatch = async (tag, newTag, tagType) => {
    const updateTagInArray = (tags) => tags.map((oldTag) => (oldTag === tag ? newTag : oldTag));
    const isJournalUpdate = tagType === TAG_TYPES.journal;

    const journalsUidsToUpdate = (isJournalUpdate ? getJournalsByTag(tag) : getJournalsByEntriesTag(tag)).map((journal) => journal.uid);
    const noUpdate = journalsUidsToUpdate.length === 0;
    logger.info(`Got ${journalsUidsToUpdate.length} journals containing the ${tagType} tag ${tag}, ${noUpdate ? 'skipping update' : 'updating'}`, { journalsUidsToUpdate });

    if (noUpdate) return undefined;

    const updateFunc = isJournalUpdate ? updateTagInArray : (entry) => ({ ...entry, tags: updateTagInArray(entry.tags) });

    const result = await _updateEntryOrJournalsByTag(journalsUidsToUpdate, tag, tagType, updateFunc);

    const formattedResult = isJournalUpdate ? result.uids : _getUpdatedUidsAndEntriesFormatted(result);

    return formattedResult;
  };

  const removeTagFromEntriesBatch = async (tag) => {
    const journalsUidsToUpdate = getJournalsByEntriesTag(tag).map((journal) => journal.uid);

    logger.info(`Got ${journalsUidsToUpdate.length} journals containing the tag ${tag} on its entries, removing`, { journalsUidsToUpdate });

    const at = new Date().toISOString();
    const removeFunc = (entry) => ({ ...entry, tags: entry.tags.filter((tags) => tags !== tag) });
    const updateHistory = (updatedIndexes) => ({
      at,
      type: UPDATE_TYPES.modifiedTag,
      relatedIndex: updatedIndexes.length === 1 ? updatedIndexes[0] : undefined,
      relatedIndexes: updatedIndexes.length === 1 ? undefined : updatedIndexes,
    });

    const result = await _updateEntryOrJournalsByTag(journalsUidsToUpdate, tag, TAG_TYPES.entry, removeFunc, updateHistory);

    return _getUpdatedUidsAndEntriesFormatted(result);
  };

  const removeTagFromJournalsBatch = async (oldTag) => {
    const journalsUidsToUpdate = getJournalsByTag(oldTag);
    logger.info(`Got ${journalsUidsToUpdate.length} journals containing the tag ${oldTag}, removing`, { journalsUidsToUpdate });

    const removeFunc = (tags) => tags.filter((tag) => tag !== oldTag);

    const result = await _updateEntryOrJournalsByTag(journalsUidsToUpdate, oldTag, TAG_TYPES.journal, removeFunc);

    return result.uids;
  };

  const updateJournal = async (uid, tags) => {
    const journal = getJournal(uid);

    const newTags = tagService.getValidatedJournalTags(journal.tags, tags);

    const history = {
      at: new Date().toISOString(),
      type: UPDATE_TYPES.modifiedTag,
      relatedUid: journal.uid,
    };

    journal.tags = newTags;
    journal.updateHistory = addNewItemOrCreateArray(journal.updateHistory, history);
    await db.save();

    logger.info('Updated tags in journal, history updated', { uid });

    return journal;
  };

  const createJournalEntry = async (timestamp, textEntry, entryTags, tags, userUid) => {
    const entryService = require('./entryService')({ db });
    const currentDate = new Date().toISOString();

    const journalTags = tagService.getValidatedJournalTags([], tags);
    const firstEntry = entryService.createEntry(currentDate, textEntry, entryTags);

    const journalEntry = {
      uid: generateUid(),
      timestamp: timestamp || currentDate,
      createdAt: currentDate,
      author: userUid,
      tags: journalTags,
      entries: firstEntry && [firstEntry],
    };

    db.get('journals').push(journalEntry);
    await db.save();

    return journalEntry;
  };

  return {
    getJournal,
    getJournalsByTag,
    addEntry,
    updateEntry,
    updateJournal,
    createJournalEntry,
    removeTagFromEntriesBatch,
    removeTagFromJournalsBatch,
    updateTagFromEntriesAndJournalsBatch,
  };
};
