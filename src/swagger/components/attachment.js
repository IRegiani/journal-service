module.exports = () => ({
  type: 'object',
  properties: {
    size: {
      type: 'string',
    },
    uid: {
      type: 'string',
      format: 'uuid',
    },
    hash: {
      type: 'string',
    },
    path: {
      type: 'string',
    },
    createdAt: {
      type: 'date-time',
    },
    addToEntry: {
      type: 'boolean',
      default: 'false',
      description: 'Add this attachment as the main entry in the journal entry',
    },
  },
  required: ['type'],
});
