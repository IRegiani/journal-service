const { createMessage } = require('../../helpers/messages');

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
        entry: {
          type: 'string',
          example: 'First day in my trip to the beach',
          description: 'This field supports really long text and markdown',
        },
        tags,
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
        content: { 'application/json': requestBody },
      },
      responses: {
        200: {
          description: 'OK',
          content: { 'application/json': journal },
          links: { newJournal: { operationId: 'getJournal', parameters: ['$response.body#/uid'] } },
        },
        400: {
          description: 'Missing parameter',
          content: createMessage('Missing parameter'),
        },
      },
    },
  };
};
