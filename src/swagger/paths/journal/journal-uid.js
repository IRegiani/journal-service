const { StatusCodes } = require('http-status-codes');

const { pathParameters } = require('../../parameters');
const { buildResponse, organizeResponses } = require('../../helpers/responses');
const { CUSTOM_RESPONSES } = require('../../../utils/constants');
const { fullJournal } = require('../../components/journal')();
const { tags } = require('../../components/tags')();

const requestBody = {
    schema: {
        type: 'object',
        properties: { tags: tags.items },
        required: ['tags'],
    },
};

module.exports = () => ({
    parameters: [pathParameters.uid],
    get: {
        tags: ['Journal'],
        summary: 'Retrieves a journal entry',
        operationId: 'getJournal',
        responses: organizeResponses(
            buildResponse(StatusCodes.OK).withJsonContent(fullJournal),
            buildResponse(StatusCodes.BAD_REQUEST).withMessage('Invalid uid'),
            buildResponse(StatusCodes.NOT_FOUND).withMessage('No journal found'),
            buildResponse(CUSTOM_RESPONSES.CODES.hashValidation).withMessage('Entry has been modified/replaced'),
        ),
    },
    patch: {
        tags: ['Journal'],
        summary: 'Updates a journal entry',
        description: 'Currently the only field that can be updated is tags',
        operationId: 'updateJournal',
        requestBody: {
            required: true,
            description: 'Updates tags in the journal',
            content: { 'application/merge-patch+json': requestBody },
        },
        responses: organizeResponses(
            buildResponse(StatusCodes.OK).withJsonContent(fullJournal),
            buildResponse(StatusCodes.BAD_REQUEST).withMessage('Invalid uid'),
            buildResponse(StatusCodes.NOT_FOUND).withMessage('No journal found'),
            buildResponse(StatusCodes.UNSUPPORTED_MEDIA_TYPE).withMessage('Invalid header value').withDescription('Invalid or missing header'),
        ),
    },
});
