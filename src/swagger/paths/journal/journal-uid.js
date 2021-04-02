module.exports = () => {
  const journalEntry = require('../../components/journal')();
  const { pathParameters } = require('../../parameters')();
  const { createMessage } = require('../../helpers/messages');
  const notFoundMessage = 'No journal found';

  return {
    get: {
      tags: ['Journal'],
      summary: 'Retrieves a journal entry',
      operationId: 'getJournal',
      parameters: [pathParameters.uid],
      responses: {
        200: {
          description: 'OK',
          content: { 'application/json': journalEntry },
        },
        404: {
          description: notFoundMessage,
          content: createMessage(notFoundMessage),
        },
      },
    },
  };
};
