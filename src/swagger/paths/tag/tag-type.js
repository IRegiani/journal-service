const { StatusCodes } = require('http-status-codes');

const { pathParameters } = require('../../parameters');
const { buildResponse, organizeResponses } = require('../../helpers/responses');
const { tagList } = require('../../components/tags')();

const requestBody = {
  schema: {
    type: 'object',
    properties: tagList.schema.items.properties,
  },
};

module.exports = () => ({
  parameters: [pathParameters.type],
  get: {
    tags: ['Tag'],
    summary: 'Gets a list of tags by type',
    description: 'Returns all tags of the requested type',
    operationId: 'listTagsByType',
    responses: organizeResponses(
      buildResponse(StatusCodes.OK).withJsonContent(tagList),
      buildResponse(StatusCodes.BAD_REQUEST).withMessage('Invalid tag type'),
    ),
  },

  post: {
    tags: ['Tag'],
    summary: 'Creates a tag',
    description: 'Creates a new tag if the name is not occupied within that type',
    operationId: 'createTag',
    requestBody: {
      required: true,
      content: { 'application/json': { ...requestBody, required: ['name'] } },
    },
    responses: organizeResponses(
      buildResponse(StatusCodes.CREATED).withJsonContent(requestBody),
      buildResponse(StatusCodes.BAD_REQUEST).withMessage('Missing tag name'),
      buildResponse(StatusCodes.CONFLICT).withMessage('Existent tag name'),
    ),
  },
});
