const { StatusCodes } = require('http-status-codes');

const { buildResponse, organizeResponses } = require('../../helpers/responses');
const { queryParameters } = require('../../parameters');
const { smallJournalList, basicJournal } = require('../../components/journal')();
const { tags } = require('../../components/tags')();

const requestBody = {
    schema: {
        type: 'object',
        properties: {
            timestamp: {
                type: 'string',
                format: 'date-time',
                example: '2021-04-02T01:23:57.183Z',
                default: new Date().toISOString(),
                description: 'Is the day of this entry, not needing to be the same as being created',
            },
            entry: {
                type: 'string',
                example: 'First day in my trip to the beach',
                description: 'This field supports really long text and markdown',
            },
            entryTags: { ...tags, description: 'Represents one or more categories of the entry' },
            tags: { ...tags, description: 'Represents one or more categories of the entry, applied on the journal' },
        },
    },
};

module.exports = () => ({
    get: {
        tags: ['Journal'],
        summary: 'Retrieves a list of journal',
        description: 'Searches all journals and returns those that satisfies the passed query params according to the order described in the following parameter list',
        operationId: 'searchJournal',
        parameters: [
            queryParameters.date,
            queryParameters.timestamp,
            queryParameters.tag,
            queryParameters.search,
            queryParameters.entryDetails,
            queryParameters.sortBy,
            queryParameters.order,
            queryParameters.limit,
            queryParameters.offset,
        ],
        responses: organizeResponses(
            buildResponse(StatusCodes.OK).withJsonContent(smallJournalList),
            buildResponse(StatusCodes.BAD_REQUEST),
        ),
    },
    post: {
        tags: ['Journal'],
        summary: 'Creates a new journal entry',
        operationId: 'newJournal',
        requestBody: {
            required: true,
            description: 'Creates a full journal entry',
            content: { 'application/json': requestBody },
        },
        responses: organizeResponses(
            buildResponse(StatusCodes.CREATED).withJsonContent(basicJournal),
            buildResponse(StatusCodes.BAD_REQUEST).withMessage('Missing or invalid property'),
        ),
    },
});
