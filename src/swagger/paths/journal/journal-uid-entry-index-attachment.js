const { StatusCodes } = require('http-status-codes');

const { pathParameters, headerParameters } = require('../../parameters');
const { buildResponse, organizeResponses } = require('../../helpers/responses');
const { FILE_TYPES, CUSTOM_RESPONSES } = require('../../../utils/constants');
const entry = require('../../components/entry')();

const requestBody = {
  schema: {
    type: 'object',
    properties: {
      file: {
        type: 'string',
        format: 'binary',
      },
    },
    required: ['file'],
  },
};

module.exports = () => ({
  post: {
    tags: ['Journal'],
    summary: 'Add a file into an existing entry',
    operationId: 'addsFileIntoEntry',
    description: `Adds a file into an existing entry inside journal entry.
                  The following file types are accepted: \n\n\`${FILE_TYPES.join(', ')}\``,
    parameters: [pathParameters.uid, pathParameters.index, headerParameters.creationDate],
    requestBody: {
      required: true,
      content: { 'multipart/form-data': requestBody },
    },
    responses: organizeResponses(
      buildResponse(StatusCodes.CREATED).withJsonContent({ schema: entry }),
      buildResponse(StatusCodes.BAD_REQUEST),
      buildResponse(StatusCodes.NOT_FOUND).withMessage('No journal found'),
      buildResponse(StatusCodes.CONFLICT).withMessage('Attachment already exists'),
      buildResponse(StatusCodes.REQUEST_TOO_LONG).withMessage('File is larger than the allowed limit'),
      buildResponse(StatusCodes.UNSUPPORTED_MEDIA_TYPE).withMessage('Invalid or missing header')
        .withDescription('Invalid or missing header, or invalid file type'),
      buildResponse(CUSTOM_RESPONSES.CODES.hashValidation).withMessage('Entry has been modified/replaced'),
    ),
  },
});
