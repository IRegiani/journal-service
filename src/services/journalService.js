const { v4: generateUid } = require('uuid');
const { StatusCodes } = require('http-status-codes');
const { differenceInSeconds } = require('date-fns');

const logger = require('../utils/logger').initLogger({ name: 'JOURNAL SERVICE' });
const { CustomError } = require('../utils/error')();
const { MAX_JOURNAL_UPDATE_TIMEOUT, UPDATE_TYPES } = require('../utils/constants');

module.exports = ({ db }) => {
  const tagService = require('./tagService')({ db });

  const getJournal = (uid) => {
    const journal = db.get('journals').value().find((jrl) => jrl.uid === uid);
    if (!journal) throw new CustomError(`Journal ${uid} not found`, StatusCodes.NOT_FOUND);
    return journal;
  };

  const newJournalHistory = (journal, entry) => {
    const fileUid = entry?.fileUids && entry.fileUids.length === 1 && entry.fileUids[0];
    const fileDate = fileUid ? db.get('files').get(fileUid).value().createdAt : undefined;

    const diff = differenceInSeconds(new Date(fileDate || entry.createdAt), new Date(journal.createdAt));
    const willAddUpdateEntry = diff > MAX_JOURNAL_UPDATE_TIMEOUT || journal.entries.length > 0;

    if (!willAddUpdateEntry) return null;

    return { type: UPDATE_TYPES.addedEntry, at: entry.createdAt };
  };

  const addEntry = async (uid, newEntry) => {
    const journal = getJournal(uid);

    const history = newJournalHistory(journal, newEntry);
    journal.entries.push(newEntry);
    if (history) journal.updateHistory.push(history);

    logger.info(`New entry added to Journal, ${history ? 'history updated' : 'history update skipped'}`);

    await db.save();
    return journal;
  };

  const createJournalEntry = async (timestamp = new Date().toISOString(), entry, entryTags, tags, user) => {
    const entryService = require('./entryService')({ db });
    const currentDate = new Date().toISOString();

    const journalTags = await tagService.addJournalTags(tags);
    const firstEntry = await entryService.createEntry(currentDate, entry, entryTags) || [];

    const journalEntry = {
      timestamp,
      createdAt: currentDate,
      updateHistory: [],
      uid: generateUid(),
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
    addEntry,
    createJournalEntry,
  };
};
