const { StatusCodes } = require('http-status-codes');

const { createHash } = require('../utils/utils');
const { CustomError } = require('../utils/error')();

module.exports = (options) => {
  const tagService = require('./tagService')(options);
  const fileService = require('./fileService')(options);
  const journalService = require('./journalService')(options);

  const createEntry = async (currentDate = new Date().toISOString(), description, entryTags = [], fileUid) => {
    const tags = await tagService.updateEntryTags(entryTags);

    if (!description && !fileUid) return [];

    return [{
      description,
      createdAt: currentDate,
      fileEntry: fileUid,
      tags,
      hash: createHash(`${description}${fileUid}${currentDate}`),
    }];
  };

  // if journal has no entry and fileEntry = true, updateHistory mantains since its the first entry
  const createAndSaveEntry = async (journalUid, description, pendingFile, fileEntry, tags) => {
    const { db } = options;

    const journal = db.get('journals').value().find((jrl) => jrl.uid === journalUid);

    if (!journal) throw new CustomError(`Journal ${journalUid} not found`, StatusCodes.NOT_FOUND);

    const date = journal.entries.length === 0 && fileEntry && journal.createdAt; // WIP: check

    const createdFile = await pendingFile;
    console.log('createdFile', createdFile);
    // const newEntry = await createEntry(date, description, tags, createdFile.uid);
    // const updatedJournal = await journalService.updateJournal(journalUid, newEntry);

    // return updatedJournal;
    return date;
  };

  return {
    createEntry,
    createAndSaveEntry,
  };
};
