const { StatusCodes } = require('http-status-codes');

const { pathParameters } = require('../../parameters');
const { buildResponse, organizeResponses } = require('../../helpers/responses');

module.exports = () => ({
  get: {
    tags: ['File'],
    summary: 'Retrieves the binary file',
    operationId: 'getFile',
    parameters: [pathParameters.uid],
    responses: organizeResponses(
      buildResponse(StatusCodes.OK).withJsonContent(),
      buildResponse(StatusCodes.BAD_REQUEST).withMessage('Invalid uid'),
      buildResponse(StatusCodes.NOT_FOUND).withMessage('No journal found'),
      buildResponse(StatusCodes.UNSUPPORTED_MEDIA_TYPE).withMessage('Invalid header value').withDescription('Invalid or missing header'),
    ),
  },
});
