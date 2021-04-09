module.exports = () => {
  const journalEntry = require('../../components/journal')();
  const { pathParameters } = require('../../parameters')();
  const { createMessage } = require('../../helpers/messages');
  const notFoundMessage = 'No journal found';
  const fileExists = 'Attachment was already uploaded';

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
        // tags,
      },
      required: ['timestamp'],
    },
  };

  return {
    put: {
      tags: ['Journal'],
      summary: 'Attach a file to a journal',
      operationId: 'attachToJournal',
      parameters: [pathParameters.uid],
      requestBody: {
        required: true,
        description: 'Creates a full journal entry',
        content: { 'application/application': requestBody },
      },
      responses: {
        200: {
          description: 'OK',
          content: { 'application/json': journalEntry },
        },
        404: {
          description: notFoundMessage,
          content: createMessage(notFoundMessage),
        },
        409: {
          description: fileExists,
          content: createMessage(fileExists),
        },
      },
    },
    get: {
      tags: ['Journal'],
      summary: 'Get attachment details from a journal entry',
      operationId: 'attachmentDetailsFromJounal',
      parameters: [pathParameters.uid],
    },
  };
};
