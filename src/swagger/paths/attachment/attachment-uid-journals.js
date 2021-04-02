module.exports = () => {
  const journalSmallEntries = require('../../components/journal')();
  const { pathParameters } = require('../../parameters')();
  const { createMessage } = require('../../helpers/messages');
  const notFoundMessage = 'No attachtment found';

  return {
    get: {
      tags: ['Attachment'],
      summary: 'Retrieves a journal entry',
      operationId: 'getAttachmentJournals',
      parameters: [pathParameters.uid],
      responses: {
        200: {
          description: 'OK',
          content: { 'application/json': journalSmallEntries },
        },
        404: {
          description: notFoundMessage,
          content: createMessage(notFoundMessage),
        },
      },
    },
  };
};
