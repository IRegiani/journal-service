const { StatusCodes } = require('http-status-codes');

const { pathParameters } = require('../../parameters');
const { buildResponse, organizeResponses } = require('../../helpers/responses');
const entry = require('../../components/entry')();
const { tags } = require('../../components/tags')();

const requestBody = {
    schema: {
        type: 'object',
        properties: { tags: tags.items },
        required: ['tags'],
    },
};

module.exports = () => ({
    patch: {
        tags: ['Journal'],
        summary: 'Updates an entry inside a journal entry',
        description: 'Currently the only field that can be updated is tags',
        parameters: [pathParameters.uid, pathParameters.index],
        operationId: 'updateEntryInJournalEntry',
        requestBody: {
            required: true,
            description: 'Updates tags in the entry if the new tag exists. Also, all tags can be removed by passing null or an empty array',
            content: { 'application/merge-patch+json': requestBody },
        },
        responses: organizeResponses(
            buildResponse(StatusCodes.OK).withJsonContent({ schema: entry }),
            buildResponse(StatusCodes.BAD_REQUEST).withMessage('Invalid uid'),
            buildResponse(StatusCodes.NOT_FOUND).withMessage('No journal found'),
            buildResponse(StatusCodes.UNSUPPORTED_MEDIA_TYPE).withMessage('Invalid header value').withDescription('Invalid or missing header'),
        ),
    },
});
