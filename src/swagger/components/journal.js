const attachments = require('./file')();
const tags = require('./tags')();

const journal = {
  schema: {
    type: 'object',
    properties: {
      description: {
        type: 'string',
        example: 'string',
        description: 'This field supports really long text and markdown',
      },
      timestamp: {
        type: 'string',
        format: 'date-time',
      },
      createdAt: {
        type: 'string',
        format: 'date-time',
      },
      uid: {
        type: 'string',
        format: 'uuid',
      },
      hash: {
        type: 'string',
      },
      tags,
      attachments: {
        type: 'array',
        items: attachments,
      },
    },
  },
};

module.exports = () => journal;
