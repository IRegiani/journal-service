const { StatusCodes } = require('http-status-codes');

const { pathParameters } = require('../../parameters');
const { buildResponse, organizeResponses } = require('../../helpers/responses');
const { CUSTOM_RESPONSES } = require('../../../utils/constants');
const mediaInfo = require('../../components/mediaInfo')();

module.exports = () => ({
    get: {
        tags: ['File'],
        summary: 'Retrieves media info from a file',
        operationId: 'getFileMediaInfo',
        parameters: [pathParameters.uid],
        responses: organizeResponses(
            buildResponse(StatusCodes.OK).withJsonContent(mediaInfo),
            buildResponse(StatusCodes.BAD_REQUEST).withMessage('Invalid uid'),
            buildResponse(StatusCodes.FORBIDDEN).withMessage('Access to file was denied'),
            buildResponse(StatusCodes.NOT_FOUND),
            buildResponse(CUSTOM_RESPONSES.CODES.hashValidation).withMessage('File has been modified/replaced'),
        ),
    },
});
