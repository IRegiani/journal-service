module.exports = () => {
  const journalSmallEntries = require('../../components/journal')(); // TODO
  const { pathParameters } = require('../../parameters')();
  const { createMessage } = require('../../helpers/messages');
  const notFoundMessage = 'No attachtment found';

  return {
    get: {
      tags: ['Attachment'],
      summary: 'Retrieves a set of journal entries',
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
