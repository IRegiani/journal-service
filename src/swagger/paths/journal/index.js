const { ATTACHMENT_TYPES } = require('../../../utils/constants');

module.exports = () => {
  const journal = require('../../components/journal')();
  const tags = require('../../components/tags')();

  const requestBody = {
    schema: {
      type: 'object',
      properties: {
        timestamp: {
          type: 'string',
          format: 'date',
          example: '2021-04-02T01:23:57.183Z',
        },
        description: {
          type: 'string',
          example: 'First day in my trip to the beach',
          description: 'This field supports really long text and markdown',
        },
        tags,
        attachmments: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              type: {
                type: 'string',
                enum: ATTACHMENT_TYPES,
              },
              file: {
                type: 'string',
                format: 'binary',
              },
              path: {
                type: 'string',
                description: 'Only when service is running in the same computer as the UI',
              },
              addToEntry: {
                type: 'boolean',
                description: 'Add this attachment as the main entry in the journal entry',
              },
            },
            required: ['type'],
          },
        },
      },
      required: ['timestamp'],
    },
  };

  return {
    post: {
      tags: ['Journal'],
      summary: 'Creates a new journal entry',
      operationId: 'newJournal',
      requestBody: {
        required: true,
        description: 'Creates a full journal entry',
        content: { 'multipart/form-data': requestBody },
      },
      responses: {
        200: {
          description: 'OK',
          content: { 'application/json': journal },
          links: { newJournal: { operationId: 'getJournal', parameters: ['$response.body#/uid'] } },
        },
      },
    },
  };
};
