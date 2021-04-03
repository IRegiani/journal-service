const { StatusCodes } = require('http-status-codes');
const { v4: generateUid } = require('uuid');

const logger = require('../utils/logger').initLogger({ name: 'JOURNAL CONTROLLER' });
const { CustomError, handleError, isExpectedError } = require('../utils/error')();

module.exports = () => {
  const JournalController = {
    async create(request, response, next) {
      const { body: { timestamp, description, tags, entryTags, attachmments } } = request;
      const { db, user } = response.locals;

      // const attachmentService = require('../services/attachmentService')({ db });
      const tagService = require('../services/tagService')({ db });
      const entryService = require('../services/entryService')({ db });

      try {
        logger.info('Creating journal entry');

        if (!timestamp || false) throw new CustomError('Missing timestamp', StatusCodes.BAD_REQUEST);

        const currentDate = new Date().toISOString();

        // await attachmentService.validateAttachments(attachmments);

        // const savedAttachements = await attachmentService.createAttachments(attachmments);
        const journalTags = await tagService.addTagToJournal(tags);
        const firstEntry = await entryService.createFirstEntry(currentDate, description, entryTags, attachmments);

        const journalEntry = {
          createdAt: currentDate,
          updateHistory: [],
          uid: generateUid(),
          entries: firstEntry,
          author: user, // WIP: improve this
          // attachments: savedAttachements,
          tags: journalTags,
          // hash
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
  };

  return JournalController;
};
