const { StatusCodes } = require('http-status-codes');

const { pathParameters, headerParameters, queryParameters } = require('../../parameters');
const { buildResponse, organizeResponses } = require('../../helpers/responses');
const { CUSTOM_RESPONSES, FILE_TYPES } = require('../../../utils/constants');

const commonVerbBody = {
  tags: ['File'],
  summary: 'Retrieves the binary file',
  operationId: 'getFile',
};

const commonResponses = [
  buildResponse(StatusCodes.BAD_REQUEST).withMessage('Invalid uid'),
  buildResponse(StatusCodes.PARTIAL_CONTENT).withDescription('Returned when the header range is used, partial content'),
  buildResponse(StatusCodes.FORBIDDEN).withMessage('Access to file was denied'),
  buildResponse(StatusCodes.NOT_FOUND),
  buildResponse(StatusCodes.REQUESTED_RANGE_NOT_SATISFIABLE),
  buildResponse(CUSTOM_RESPONSES.CODES.hashValidation).withMessage('File has been modified/replaced'),
];

const customContent = FILE_TYPES.reduce((acc, type) => ({ ...acc, [type]: { schema: { type: 'string', format: 'binary', example: '' } } }), {});
const headers = [
  headerParameters.acceptRanges,
  headerParameters.contentRange,
  headerParameters.contentDisposition,
  headerParameters.creationDate,
  headerParameters.mediaInfo,
];

module.exports = () => ({
  parameters: [pathParameters.uid, headerParameters.range, queryParameters.includeMediaInfo],
  get: {
    ...commonVerbBody,
    responses: organizeResponses(
      buildResponse(StatusCodes.OK).withCustomContent(customContent).withHeaders(headers),
      ...commonResponses,
    ),
  },
  head: {
    ...commonVerbBody,
    summary: 'Retrieves the binary file metadata',
    operationId: 'getFileMetadata',
    responses: organizeResponses(
      buildResponse(StatusCodes.NO_CONTENT).withHeaders(headers),
      ...commonResponses,
    ),
  },
});
