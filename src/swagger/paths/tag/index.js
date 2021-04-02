const { createMessage } = require('../../helpers/messages');

const sucessMessage = 'Success';

module.exports = () => {
  const { pathParameters } = require('../../parameters')();

  return {
    get: {
      tags: ['Tag'],
      summary: 'Gets a list of journal entries',
      operationId: 'getEntriesByTag',
      responses: {
        200: {
          description: 'A list of journal entries',
          content: createMessage(sucessMessage),
        },
      },
    },

    put: {
      tags: ['Tag'],
      summary: 'Renames a tag',
      operationId: 'tagRename',
      requestBody: {
        required: true,
        description: 'Renames a tag in all journal entries',
      },
      content: {
        'application/json': {
          schema: {
            type: 'string',
            example: 'string',
          },
        },
      },
      responses: {
        200: {
          description: 'OK',
          content: createMessage(sucessMessage),
        },
      },
    },

    delete: {
      tags: ['Tag'],
      summary: 'Deletes a tag',
      operationId: 'tagDelete',
      parameters: [pathParameters.tag],
      responses: {
        200: {
          description: 'OK',
          content: createMessage(sucessMessage),
        },
      },
    },
  };
};
