const { StatusCodes } = require('http-status-codes');
const { validate } = require('uuid');

const logger = require('../utils/logger').initLogger({ name: 'FILE CONTROLLER' });
const { CustomError, handleError, isExpectedError } = require('../utils/error')();

module.exports = () => {
    const FileController = {
        async getFile(request, response, next) {
            const { params: { uid }, query: { includeMediaInfo }, user } = request;
            const { db } = response.locals;

            const fileService = require('../services/fileService')({ db });
            try {
                logger.info('Getting file', { uid, userUid: user.uid, includeMediaInfo });

                if (!validate(uid)) throw new CustomError('Invalid UID', StatusCodes.BAD_REQUEST);

                const range = request.headers.range || request.headers.Range;
                const isHeadRequest = request.method === 'HEAD';

                return fileService.retrieveFile(response, uid, user.uid, range, isHeadRequest, includeMediaInfo);
            } catch (error) {
                if (isExpectedError(error)) return handleError(response, error, logger);

                return next(error);
            }
        },

        async getFileMediaInfo(request, response, next) {
            const { params: { uid }, user } = request;
            const { db } = response.locals;

            const fileService = require('../services/fileService')({ db });
            try {
                logger.info('Getting file media info', { uid, userUid: user.uid });

                if (!validate(uid)) throw new CustomError('Invalid UID', StatusCodes.BAD_REQUEST);

                const [, mediaInfo] = await Promise.all([fileService.retrieveFileDetails(uid, user.uid), fileService.getMediaInfo(uid)]);

                return response.status(StatusCodes.OK).json(mediaInfo);
            } catch (error) {
                if (isExpectedError(error)) return handleError(response, error, logger);

                return next(error);
            }
        },
    };

    return FileController;
};
