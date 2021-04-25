const { v4: generateUid } = require('uuid');
const { StatusCodes } = require('http-status-codes');
const { differenceInSeconds } = require('date-fns');

const logger = require('../utils/logger').initLogger({ name: 'JOURNAL SERVICE' });
const { CustomError } = require('../utils/error')();
const { MAX_JOURNAL_UPDATE_TIMEOUT, UPDATE_TYPES } = require('../utils/constants');
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
    (journal) => journal.entries?.filter((entry) => entry.tags.includes(tag)),
  );

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
      at: file?.createdAt || new Date().toISOString(),
      type: file ? UPDATE_TYPES.addedFile : UPDATE_TYPES.modifiedTag,
      relatedUid: file && file.uid,
      relatedIndex: index,
    };

    journal.entries[index] = entry;
    journal.updateHistory = addNewItemOrCreateArray(journal.updateHistory, history);
    await db.save();

    logger.info(`Updated entry ${index} in journal`, { uid, index });

    return journal;
  };

  const updateBatchEntriesByTag = async (tag) => {
    const journalsUidsToUpdate = getJournalsByEntriesTag(tag).map((journal) => journal.uid);
    const allJournals = db.get('journals').value();

    logger.info(`Got ${journalsUidsToUpdate.length} journals containing the tag ${tag} on its entries, updating`, { journalsUidsToUpdate });

    const at = new Date().toISOString();
    allJournals.forEach((journal, journalIndex) => {
      if (journalsUidsToUpdate.includes(journal.uid)) {
        const updatedIndexes = [];
        journal.entries.forEach((entry, index) => {
          if (entry.tags.includes(tag)) {
            updatedIndexes.push(index);
            allJournals[journalIndex].entries[index] = entry.tags.filter((tags) => tags !== tag);
          }
        });

        const history = {
          at,
          type: UPDATE_TYPES.modifiedTag,
          relatedIndex: updatedIndexes.length === 1 ? updatedIndexes[0] : undefined,
          relatedIndexes: updatedIndexes.length === 1 ? undefined : updatedIndexes,
        };

        allJournals[journalIndex].updateHistory = addNewItemOrCreateArray(journal.updateHistory, history);
        logger.debug(`Updated entry(ies) ${updatedIndexes} in journal`, { uid: journal.uid });
      }
    });

    await db.get('journals').set(allJournals).save();

    return journalsUidsToUpdate;
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

  const createJournalEntry = async (timestamp = new Date().toISOString(), entry, entryTags, tags, user) => {
    const entryService = require('./entryService')({ db });
    const currentDate = new Date().toISOString();

    const journalTags = tagService.getValidatedJournalTags([], tags);
    const firstEntry = await entryService.createEntry(currentDate, entry, entryTags);

    const journalEntry = {
      uid: generateUid(),
      timestamp,
      createdAt: currentDate,
      entries: firstEntry,
      author: user, // TODO: Add user uid
      tags: journalTags,
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
    updateBatchEntriesByTag,
  };
};
