const attachments = require('./attachment')();
const entries = require('./entry')();
const tags = require('./tags')();

const journal = {
  schema: {
    type: 'object',
    properties: {
      entries: {
        type: 'array',
        items: entries,
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
