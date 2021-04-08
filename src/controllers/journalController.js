const { StatusCodes } = require('http-status-codes');
const { v4: generateUid, validate } = require('uuid');

const logger = require('../utils/logger').initLogger({ name: 'JOURNAL CONTROLLER' });
const { isIsoDateString } = require('../utils/validators');
const { CustomError, handleError, isExpectedError } = require('../utils/error')();

module.exports = () => {
  const JournalController = {
    async create(request, response, next) {
      const { body: { timestamp, entry, tags, entryTags }, user } = request;
      const { db } = response.locals;

      const tagService = require('../services/tagService')({ db });
      const entryService = require('../services/entryService')({ db });

      try {
        logger.info('Creating journal entry');

        if (!timestamp) throw new CustomError('Missing timestamp', StatusCodes.BAD_REQUEST);
        if (!isIsoDateString(timestamp)) throw new CustomError('Invalid timestamp', StatusCodes.BAD_REQUEST);

        const currentDate = new Date().toISOString();

        const journalTags = await tagService.updateJournalTags(tags);
        const firstEntry = await entryService.createEntry(currentDate, entry, entryTags);

        const journalEntry = {
          createdAt: currentDate,
          updateHistory: [],
          uid: generateUid(),
          entries: firstEntry,
          author: user, // WIP: improve this
          attachments: {},
          tags: journalTags,
        };

        db.get('journals').push(journalEntry);
        await db.save();

        logger.success('Journal created sucessfully', { journalUid: journalEntry.uid });

        return response.status(StatusCodes.CREATED).json(journalEntry);
      } catch (error) {
        if (isExpectedError(error)) return handleError(response, error, logger);

        return next(error);
      }
    },

    // fileEntry false treats the file as attachment to entry
    async addEntry(request, response, next) {
      const { body: { description, tags, fileEntry }, params: { uid }, file } = request;
      const { db } = response.locals;

      const fileService = require('../services/fileService')({ db });
      const entryService = require('../services/entryService')({ db });

      try {
        logger.info('Creating entry');

        const pendingFile = await fileService.receiveFile(request);

        // const { isNoop: noFile, ...others } = file('file').upload({ dirname: os.tmpdir() }, callback);

        // console.log('filereturn', others);

        console.log('noFile', pendingFile);
        console.log('pendingFile', JSON.stringify(pendingFile));
        const noFile = false;

        // if journal has no entry and fileEntry = true, updateHistory mantains since its the first entry
        // if no entry and has a flag updateEntryTags, read journal date

        if (!validate(uid)) throw new CustomError('Invalid UID', StatusCodes.BAD_REQUEST);
        if (!(description || noFile)) throw new CustomError('Missing entry body', StatusCodes.BAD_REQUEST);

        const entry = await entryService.createAndSaveEntry(uid, description, pendingFile, fileEntry, tags);


        const message = noFile ? 'Entry created sucessfully' : 'Entry created sucessfully with file';
        logger.success(message);

        return response.status(StatusCodes.CREATED).json(entry);
      } catch (error) {
        if (isExpectedError(error)) return handleError(response, error, logger);

        return next(error);
      }
    },
  };

  return JournalController;
};
