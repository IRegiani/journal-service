const { StatusCodes } = require('http-status-codes');

const logger = require('../utils/logger').initLogger({ name: 'TAG CONTROLLER' });
const { handleError, isExpectedError } = require('../utils/error')();
const { validateHeaders } = require('../utils/validators');

module.exports = () => {
    const TagController = {

        async createTag(request, response, next) {
            const { body: { name, description, color }, user } = request;
            const { type } = request.params;
            const { db } = response.locals;

            const tagService = require('../services/tagService')({ db });

            try {
                logger.info(`Creating ${type} tag`);
                validateHeaders(request);

                const tag = await tagService.createTag(name, description, color, user.uid, type);

                logger.success(`Created ${type} tag successfully`);

                return response.status(StatusCodes.CREATED).json(tag);
            } catch (error) {
                if (isExpectedError(error)) return handleError(response, error, logger);

                return next(error);
            }
        },

        async getTag(request, response, next) {
            const { user } = request;
            const { type, tag } = request.params;
            const { db } = response.locals;

            const tagService = require('../services/tagService')({ db });

            try {
                logger.info(`Getting ${type} tag ${tag}`);

                const res = await tagService.getTag(user.uid, type, tag);

                logger.success(`Got ${type} tag ${tag} successfully`);

                return response.status(StatusCodes.OK).json(res);
            } catch (error) {
                if (isExpectedError(error)) return handleError(response, error, logger);

                return next(error);
            }
        },

        async listTags(request, response, next) {
            const { user } = request;
            const { type } = request.params;
            const { db } = response.locals;

            const tagService = require('../services/tagService')({ db });

            try {
                logger.info(`Getting ${type} tags`);

                const tag = await tagService.getTags(user.uid, type);

                logger.success(`Got ${type} tags successfully`);

                return response.status(StatusCodes.OK).json(tag);
            } catch (error) {
                if (isExpectedError(error)) return handleError(response, error, logger);

                return next(error);
            }
        },

        async updateTag(request, response, next) {
            const { user, body } = request;
            const { type, tag } = request.params;
            const { db } = response.locals;

            const tagService = require('../services/tagService')({ db });

            try {
                logger.info(`Updating ${type} tag ${tag}`);
                validateHeaders(request, { 'content-type': 'application/merge-patch+json' });

                const res = await tagService.updateTag(user.uid, type, tag, body);

                logger.success(`Updated ${type} tag ${tag} successfully`);

                return response.status(StatusCodes.OK).json(res);
            } catch (error) {
                if (isExpectedError(error)) return handleError(response, error, logger);

                return next(error);
            }
        },

        async deleteTag(request, response, next) {
            const { user } = request;
            const { type, tag } = request.params;
            const { db } = response.locals;

            const tagService = require('../services/tagService')({ db });

            try {
                logger.info(`Deleting ${type} tag ${tag}`, { type, tag });

                const res = await tagService.deleteTag(user.uid, type, tag);

                logger.success(`Deleted ${type} tag ${tag} successfully`);

                return response.status(StatusCodes.OK).json(res);
            } catch (error) {
                if (isExpectedError(error)) return handleError(response, error, logger);

                return next(error);
            }
        },
    };

    return TagController;
};
