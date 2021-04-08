module.exports = () => {
  const journalEntry = require('../../components/journal')();
  const { pathParameters } = require('../../parameters')();
  const { createMessage } = require('../../helpers/messages');
  const notFoundMessage = 'No journal found';
  const fileExists = 'Attachment already exists on this journal';

  return {
    put: {
      tags: ['Journal'],
      summary: 'Creates a new entry into a journal',
      operationId: 'attachToJournal',
      parameters: [pathParameters.uid],
      // WIP: add request body
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
          description: fileExists, // WIP: https://stackoverflow.com/questions/3825990/http-response-code-for-post-when-resource-already-exists
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
