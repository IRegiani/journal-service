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
        const firstEntry = await entryService.createEntry(currentDate, entry, entryTags) || [];

        const journalEntry = {
          createdAt: currentDate,
          updateHistory: [],
          uid: generateUid(),
          entries: firstEntry,
          author: user, // TODO: Add user uid
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
      const { body: { description, tags, fileEntry }, params: { uid } } = request;
      const { db } = response.locals;

      const fileService = require('../services/fileService')({ db });
      const entryService = require('../services/entryService')({ db });

      try {
        logger.info('Creating entry');
        const journal = db.get('journals').value().find((jrl) => jrl.uid === uid);

        if (!validate(uid)) throw new CustomError('Invalid UID', StatusCodes.BAD_REQUEST);
        if (!journal) throw new CustomError(`Journal ${uid} not found`, StatusCodes.NOT_FOUND);

        const file = await fileService.receiveFile(request);

        if (!(description || file)) throw new CustomError('Missing entry body', StatusCodes.BAD_REQUEST);
        if (fileEntry && !file) throw new CustomError('File is required when using *fileEntry*', StatusCodes.BAD_REQUEST);

        const entry = await entryService.createAndSaveEntry(journal, description, file, fileEntry, tags);

        const message = file ? 'Entry created sucessfully with file' : 'Entry created sucessfully';
        logger.success(message);

        return response.status(StatusCodes.CREATED).json(entry);
      } catch (error) {
        if (isExpectedError(error, 'E_EXCEEDS_UPLOAD_LIMIT')) return handleError(response, error, logger);

        return next(error);
      }
    },
  };

  return JournalController;
};
