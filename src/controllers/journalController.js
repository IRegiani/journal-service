const { StatusCodes } = require('http-status-codes');
const { validate } = require('uuid');
const { isFuture } = require('date-fns');

const logger = require('../utils/logger').initLogger({ name: 'JOURNAL CONTROLLER' });
const { isIsoDateString, validateHeaders } = require('../utils/validators');
const { CustomError, handleError, isExpectedError } = require('../utils/error')();
const { paginateItems, sortItems } = require('../utils/utils');

module.exports = () => {
  const JournalController = {
    async createJournal(request, response, next) {
      const { body: { timestamp, entry, tags, entryTags }, user } = request;
      const { db } = response.locals;

      const journalService = require('../services/journalService')({ db });

      try {
        logger.info('Creating journal entry');
        validateHeaders(request);

        if (timestamp && !isIsoDateString(timestamp)) throw new CustomError('Invalid timestamp', StatusCodes.BAD_REQUEST);
        if (timestamp && isFuture(new Date(timestamp))) throw new CustomError('Not allowed future timestamp', StatusCodes.BAD_REQUEST);

        const journal = await journalService.createJournalEntry(timestamp, entry, entryTags, tags, user.uid);

        logger.success('Journal created successfully', { journalUid: journal.uid });

        return response.status(StatusCodes.CREATED).json(journal);
      } catch (error) {
        if (isExpectedError(error)) return handleError(response, error, logger);

        // This return is not necessary, but let's leave eslint happy
        return next(error);
      }
    },

    async retrieve(request, response, next) {
      const { params: { uid } } = request;
      const { db } = response.locals;

      const journalService = require('../services/journalService')({ db });
      const entryService = require('../services/entryService')({ db });
      try {
        logger.info('Getting Journal', { uid });

        if (!validate(uid)) throw new CustomError('Invalid UID', StatusCodes.BAD_REQUEST);
        const journal = journalService.getJournal(uid);

        entryService.validate(journal.entries);

        return response.status(StatusCodes.OK).json(journal);
      } catch (error) {
        if (isExpectedError(error)) return handleError(response, error, logger);

        return next(error);
      }
    },

    // In order to other fields be validated early, the file should be the last field
    async addEntry(request, response, next) {
      const { body: { description, tags, fileEntry }, params: { uid } } = request;
      const { db } = response.locals;

      const fileService = require('../services/fileService')({ db });
      const entryService = require('../services/entryService')({ db });
      const journalService = require('../services/journalService')({ db });
      const tagService = require('../services/tagService')({ db });

      try {
        logger.info('Creating entry');
        validateHeaders(request, { 'content-type': 'multipart/form-data; boundary=' });

        if (!validate(uid)) throw new CustomError('Invalid UID', StatusCodes.BAD_REQUEST);
        tagService.getValidatedEntryTags([], tags);
        const journal = journalService.getJournal(uid);
        const file = await fileService.receiveFile(request);

        if (!(description || file)) throw new CustomError('Missing entry file or description', StatusCodes.BAD_REQUEST);
        if (fileEntry && !file) throw new CustomError('File is required when using *fileEntry*', StatusCodes.BAD_REQUEST);
        // TODO: Clean saved file, test error flow
        if (fileEntry && file && !file.type.includes('video')) throw new CustomError('Only a video file can be an fileEntry', StatusCodes.BAD_REQUEST);

        const entry = await entryService.createAndSaveEntry(journal, description, file, fileEntry, tags);

        const message = file ? 'Entry created successfully with file' : 'Entry created successfully';
        logger.success(message);

        return response.status(StatusCodes.CREATED).json(entry);
      } catch (error) {
        if (isExpectedError(error, 'E_EXCEEDS_UPLOAD_LIMIT')) return handleError(response, error, logger);

        return next(error);
      }
    },

    async retrieveEntries(request, response, next) {
      const { params: { uid } } = request;
      const { db } = response.locals;

      const entryService = require('../services/entryService')({ db });
      const journalService = require('../services/journalService')({ db });

      try {
        logger.info('Getting journal entries', { uid });

        if (!validate(uid)) throw new CustomError('Invalid UID', StatusCodes.BAD_REQUEST);
        const { entries } = journalService.getJournal(uid);

        const res = await entryService.retrieveEntriesDetails(entries);

        return response.status(StatusCodes.OK).json(res);
      } catch (error) {
        if (isExpectedError(error)) return handleError(response, error, logger);

        return next(error);
      }
    },

    async addAttachmentToEntry(request, response, next) {
      const { params: { uid, index } } = request;
      const { db } = response.locals;

      const fileService = require('../services/fileService')({ db });
      const entryService = require('../services/entryService')({ db });
      const journalService = require('../services/journalService')({ db });

      try {
        logger.info('Adding attachment to entry', { index, uid });
        validateHeaders(request, { 'content-type': 'multipart/form-data; boundary=' });

        if (!validate(uid)) throw new CustomError('Invalid UID', StatusCodes.BAD_REQUEST);
        if (!index) throw new CustomError('Missing entry index', StatusCodes.BAD_REQUEST);

        const journal = journalService.getJournal(uid);
        const parsedIndex = parseInt(index, 10);

        if (!journal.entries) throw new CustomError('Journal has no entries', StatusCodes.NOT_FOUND);
        if (Number.isNaN(parsedIndex)) throw new CustomError('Invalid entry index', StatusCodes.BAD_REQUEST);
        // eslint-disable-next-line security/detect-object-injection
        if (!journal.entries[parsedIndex]) throw new CustomError('Invalid entry index, entry not found', StatusCodes.NOT_FOUND);

        // eslint-disable-next-line security/detect-object-injection
        entryService.validate([journal.entries[parsedIndex]]);
        const file = await fileService.receiveFile(request);

        if (!file) throw new CustomError('Missing file', StatusCodes.BAD_REQUEST);

        const updatedEntry = await entryService.addAttachment(index, journal, file);

        logger.success('Entry updated with new attachment', { index, uid });

        return response.status(StatusCodes.OK).json(updatedEntry);
      } catch (error) {
        if (isExpectedError(error, 'E_EXCEEDS_UPLOAD_LIMIT')) return handleError(response, error, logger);

        return next(error);
      }
    },

    // The only field that can be updated is tags
    async updateEntry(request, response, next) {
      const { body: { tags }, params: { uid, index } } = request;
      const { db } = response.locals;

      const entryService = require('../services/entryService')({ db });
      const journalService = require('../services/journalService')({ db });

      try {
        logger.info('Updating entry', { index, uid, tags });
        validateHeaders(request, { 'content-type': 'application/merge-patch+json' });

        if (!validate(uid)) throw new CustomError('Invalid UID', StatusCodes.BAD_REQUEST);
        if (!index) throw new CustomError('Missing entry index', StatusCodes.BAD_REQUEST);
        if (tags === undefined) throw new CustomError('Missing tag property', StatusCodes.BAD_REQUEST);

        const journal = journalService.getJournal(uid);
        const parsedIndex = parseInt(index, 10);

        if (!journal.entries) throw new CustomError('Journal has no entries', StatusCodes.NOT_FOUND);
        if (Number.isNaN(parsedIndex)) throw new CustomError('Invalid entry index', StatusCodes.BAD_REQUEST);
        // eslint-disable-next-line security/detect-object-injection
        if (!journal.entries[parsedIndex]) throw new CustomError('Invalid entry index, entry not found', StatusCodes.NOT_FOUND);

        const updatedEntry = await entryService.updateEntryTags(parsedIndex, journal, tags);

        logger.success('Entry updated', { index, uid });

        return response.status(StatusCodes.OK).json(updatedEntry);
      } catch (error) {
        if (isExpectedError(error)) return handleError(response, error, logger);

        return next(error);
      }
    },

    // The only field that can be updated is tags
    async updateJournalEntry(request, response, next) {
      const { body: { tags }, params: { uid } } = request;
      const { db } = response.locals;

      const journalService = require('../services/journalService')({ db });

      try {
        logger.info('Updating journal', { uid, tags });
        validateHeaders(request, { 'content-type': 'application/merge-patch+json' });

        if (!validate(uid)) throw new CustomError('Invalid UID', StatusCodes.BAD_REQUEST);
        if (tags === undefined) throw new CustomError('Missing tag property', StatusCodes.BAD_REQUEST);

        const updatedJournal = await journalService.updateJournal(uid, tags);

        logger.success('Journal updated', { uid });

        return response.status(StatusCodes.OK).json(updatedJournal);
      } catch (error) {
        if (isExpectedError(error)) return handleError(response, error, logger);

        return next(error);
      }
    },

    async searchJournals(request, response, next) {
      const { query, user } = request;
      const { db } = response.locals;

      const journalService = require('../services/journalService')({ db });

      try {
        logger.info('Searching journal entries', query);

        const journals = await journalService.getFilteredJournals(query, user.uid);

        const selectors = {
          timestamp: (item) => new Date(item.timestamp),
          createdAt: (item) => new Date(item.createdAt),
          tag: (item) => item.tags?.sort()[0],
          entryTag: (item) => item.entries.filter((entryItem) => entryItem.tags),
          fileAmount: (item) => item.entries.reduce((acc, entryItem) => (entryItem.fileUids?.length !== 0 ? acc + entryItem.fileUids.length : acc), 0),
          entryAmount: (item) => item.entries.length,
          // WIP: Check how an invalid date is sorted
          updateHistory: (item) => new Date(item.updateHistory[item.updateHistory?.length - 1]?.updatedAt),
          // entryDetails ?
        };

        const sortedJournals = sortItems({ sortBy: 'timestamp', ...query }, journals, selectors);
        const { list: paginatedJournals, headers } = paginateItems(query, sortedJournals);

        return response.set(headers).status(StatusCodes.OK).json(paginatedJournals);
      } catch (error) {
        if (isExpectedError(error)) return handleError(response, error, logger);

        return next(error);
      }
    },
  };

  return JournalController;
};
