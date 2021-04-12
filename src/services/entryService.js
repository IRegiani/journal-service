const { differenceInSeconds } = require('date-fns');

const { createHash } = require('../utils/utils');
const logger = require('../utils/logger').initLogger({ name: 'ENTRY SERVICE' });
const { MAX_JOURNAL_UPDATE_TIMEOUT } = require('../utils/constants');

module.exports = (options) => {
  const tagService = require('./tagService')(options);
  const journalService = require('./journalService')(options);

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

  return {
    createEntry,
    createAndSaveEntry,
  };
};
