const { StatusCodes } = require('http-status-codes');

const { pathParameters, headerParameters } = require('../../parameters');
const { buildResponse, organizeResponses } = require('../../helpers/responses');
const { FILE_TYPES, CUSTOM_RESPONSES } = require('../../../utils/constants');
const { getObjectWithoutKeys } = require('../../../utils/utils');
const { tags } = require('../../components/tags')();
const entry = require('../../components/entry')();
const file = require('../../components/file')();

const requestBody = {
  schema: {
    type: 'object',
    properties: {
      description: entry.properties.description,
      tags: tags.items,
      fileEntry: {
        type: 'boolean',
        description: 'Marks the file uid to be used as an video entry, not just a file',
      },
      file: {
        type: 'string',
        format: 'binary',
      },
    },
    required: ['description', 'file'],
  },
};

const entryDetailsResponse = {
  schema: {
    type: 'object',
    properties: {
      ...getObjectWithoutKeys(entry.properties, ['fileUids']),
      files: {
        type: 'array',
        items: file,
      },
    },
  },
};

module.exports = () => ({
  parameters: [pathParameters.uid],
  post: {
    tags: ['Journal'],
    summary: 'Creates a new entry into a journal entry',
    operationId: 'newEntryIntoJournal',
    description: `Creates a new entry inside an existing _journal entry_, optionally with as a video entry or with a file as attachment.
                  The following file types are accepted: \n\n\`${FILE_TYPES.join(', ')}\``,
    parameters: [headerParameters.creationDate],
    requestBody: {
      required: true,
      description: 'In order to other fields be validated "early", the file should be the _last field_. **File or description is required**',
      content: { 'multipart/form-data': requestBody },
    },
    responses: organizeResponses(
      buildResponse(StatusCodes.CREATED).withJsonContent({ schema: entry }),
      buildResponse(StatusCodes.BAD_REQUEST),
      buildResponse(StatusCodes.NOT_FOUND).withMessage('No journal found'),
      buildResponse(StatusCodes.CONFLICT).withMessage('File already exists'),
      buildResponse(StatusCodes.REQUEST_TOO_LONG).withMessage('File is larger than the allowed limit'),
      buildResponse(StatusCodes.UNSUPPORTED_MEDIA_TYPE).withMessage('Invalid header value')
        .withDescription('Invalid or missing header, or invalid file type'),
    ),
  },
  get: {
    tags: ['Journal'],
    summary: 'Get all entries with file details from a journal entry',
    description: 'All entries are returned and those that have a file its details are also included',
    operationId: 'entriesDetailsFromJournal',
    responses: organizeResponses(
      buildResponse(StatusCodes.OK).withJsonContent(entryDetailsResponse),
      buildResponse(StatusCodes.BAD_REQUEST).withMessage('Invalid UID'),
      buildResponse(StatusCodes.NOT_FOUND).withMessage('No journal found'),
      buildResponse(CUSTOM_RESPONSES.CODES.hashValidation),
    ),
  },
});
