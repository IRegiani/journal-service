const { StatusCodes } = require('http-status-codes');
const { validate } = require('uuid');

const logger = require('../utils/logger').initLogger({ name: 'JOURNAL CONTROLLER' });
const { isIsoDateString } = require('../utils/validators');
const { CustomError, handleError, isExpectedError } = require('../utils/error')();

module.exports = () => {
  const JournalController = {
    async create(request, response, next) {
      const { body: { timestamp, entry, tags, entryTags }, user } = request;
      const { db } = response.locals;

      const journalService = require('../services/journalService')({ db });

      try {
        logger.info('Creating journal entry');

        if (timestamp && !isIsoDateString(timestamp)) throw new CustomError('Invalid timestamp', StatusCodes.BAD_REQUEST);

        const journal = await journalService.createJournalEntry(timestamp, entry, entryTags, tags, user);

        logger.success('Journal created successfully', { journalUid: journal.uid });

        return response.status(StatusCodes.CREATED).json(journal);
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
      const journalService = require('../services/journalService')({ db });

      try {
        logger.info('Creating entry');
        const journal = journalService.getJournal(uid);

        if (!validate(uid)) throw new CustomError('Invalid UID', StatusCodes.BAD_REQUEST);

        const file = await fileService.receiveFile(request);

        if (!(description || file)) throw new CustomError('Missing entry body', StatusCodes.BAD_REQUEST);
        if (fileEntry && !file) throw new CustomError('File is required when using *fileEntry*', StatusCodes.BAD_REQUEST);

        const entry = await entryService.createAndSaveEntry(journal, description, file, fileEntry, tags);

        const message = file ? 'Entry created successfully with file' : 'Entry created successfully';
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
