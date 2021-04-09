const { createHash } = require('../utils/utils');
// const { CustomError } = require('../utils/error')();

module.exports = (options) => {
  const tagService = require('./tagService')(options);
  const journalService = require('./journalService')(options);

  const createEntry = async (currentDate = new Date().toISOString(), description, entryTags = [], fileUid, fileEntry) => {
    const tags = await tagService.updateEntryTags(entryTags);

    if (!description && !fileUid) return undefined;

    return {
      description,
      createdAt: currentDate,
      fileUid,
      fileEntry,
      tags,
      hash: createHash(`${description}${fileUid}${currentDate}`),
    };
  };

  const createAndSaveEntry = async (journal, description, file, fileEntry, tags) => {
    // if this happens right after journal is created, the entry receives the journal creation date (< 5 seconds)
    // the same is valid for files, but if they have more than 500MB and the creation date is within 1 min
    const date = journal.entries.length === 0 && journal.createdAt; // WIP: check

    const newEntry = await createEntry(date, description, tags, file?.uid, fileEntry);
    const updatedJournal = await journalService.addEntry(journal.uid, newEntry);

    return updatedJournal;
  };

  return {
    createEntry,
    createAndSaveEntry,
  };
};
