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

const baseTag = (otherProperties) => ({
  type: 'object',
  properties: {
    tag: tagList.schema.items,
    ...otherProperties,
  },
});

const modifiedJournalsSchema = {
  modifiedJournals: {
    type: 'array',
    items: {
      type: 'string',
      format: 'uuid',
      example: '37d7095d-dfe3-4aea-8f71-9afc1d244050',
      description: 'List of Journals that were updated',
    },
  },
};

const modifiedEntriesSchema = {
  modifiedEntries: {
    type: 'object',
    properties: {
      '37d7095d-dfe3-4aea-8f71-9afc1d244050': {
        type: 'array',
        items: {
          type: 'number',
          example: 16,
          description: 'List of Journals that were updated',
        },
      },
    },
  },
};

const tag = {
  name: 'lzsi2',
  color: '#9d32a8',
  description: 'Beach travel with friends in february',
};

// this could be extracted from the schema... but the swagger UI just gets one, not two,
// this way the dropdown is enabled. Anyway, way easier doing by hand than getting from both schemas
const examples = {
  modifiedJournals: { value: { tag, modifiedJournals: ['44e84aca-2779-4210-a38e-9a98b1cf9d72', 'f814a6ff-d89f-41e2-aea8-f01c02a74fdb'] } },
  modifiedEntries: {
    value: {
      tag,
      modifiedEntries: {
        '37d7095d-dfe3-4aea-8f71-9afc1d244050': [0, 5, 6, 16],
        '08902100-75c7-4b29-a576-f4181039bf8e': [1],
      },
    },
  },
};

const response = { schema: { oneOf: [baseTag(modifiedJournalsSchema), baseTag(modifiedEntriesSchema)] }, examples };

module.exports = () => ({
  parameters: [pathParameters.tag, pathParameters.type],
  get: {
    tags: ['Tag'],
    summary: 'Gets a specific tag',
    description: 'Returns one tag',
    operationId: 'getTag',
    responses: organizeResponses(
      buildResponse(StatusCodes.OK).withJsonContent(requestBody),
      buildResponse(StatusCodes.BAD_REQUEST).withMessage('Invalid tag type'),
      buildResponse(StatusCodes.NOT_FOUND).withMessage('Tag not found'),
    ),
  },

  patch: {
    tags: ['Tag'],
    summary: 'Updates a tag',
    description: 'Any tag property can be updated. If the name is updated, all references to it are also updated',
    operationId: 'updateTag',
    requestBody: {
      required: true,
      content: { 'application/merge-patch+json': requestBody },
    },
    responses: organizeResponses(
      buildResponse(StatusCodes.OK).withJsonContent(response)
        .withDescription('This response can be **one of** the two defined schemas, according to the entities that the tag has the relation'),
      buildResponse(StatusCodes.BAD_REQUEST).withMessage('Invalid tag type'),
      buildResponse(StatusCodes.NOT_FOUND).withMessage('Tag not found'),
      buildResponse(StatusCodes.CONFLICT).withMessage('Existent tag name'),
      buildResponse(StatusCodes.UNSUPPORTED_MEDIA_TYPE).withMessage('Invalid header value').withDescription('Invalid or missing header'),
      buildResponse(StatusCodes.UNPROCESSABLE_ENTITY).withMessage('Name cannot be erased'),
    ),
  },

  delete: {
    tags: ['Tag'],
    summary: 'Deletes a tag',
    operationId: 'deleteTag',
    description: 'Deletes a tag and removes all references to it, according to it\'s type',
    responses: organizeResponses(
      buildResponse(StatusCodes.OK).withJsonContent(response)
        .withDescription('This response can be **one of** two defined schema, according to the entities that the tag has relations'),
      buildResponse(StatusCodes.BAD_REQUEST).withMessage('Invalid tag type'),
      buildResponse(StatusCodes.NOT_FOUND).withMessage('Tag not found'),
    ),
  },
});
