module.exports = {
  offset: {
    in: 'query',
    name: 'offset',
    description: 'The number of items to skip before starting to collect the result set',
    schema: {
      type: 'integer',
    },
  },
  limit: {
    in: 'query',
    name: 'limit',
    description: 'The numbers of items to return',
    schema: {
      type: 'integer',
      default: 10,
    },
  },
  includeMediaInfo: {
    in: 'query',
    name: 'includeMediaInfo',
    description: 'When used, includes an summary of media info data if available in the response header',
    schema: {
      type: 'boolean',
      default: false,
    },
  },
};
