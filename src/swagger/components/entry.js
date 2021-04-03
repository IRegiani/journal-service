const tags = require('./tags')();

module.exports = () => ({
  type: 'object',
  properties: {
    description: {
      type: 'string',
      description: 'This field supports really long text and markdown',
    },
    date: {
      type: 'string',
      format: 'date-time',
    },
    file: {
      type: 'string',
      format: 'uuid',
    },
    tags,
    hash: {
      type: 'string',
    },
  },
});
