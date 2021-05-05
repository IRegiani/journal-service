module.exports = {
  offset: {
    in: 'query',
    name: 'offset',
    schema: {
      type: 'integer',
      description: 'The number of items to skip before starting to collect the result set',
    },
  },
  limit: {
    in: 'query',
    name: 'limit',
    schema: {
      type: 'integer',
      default: 10,
      description: 'he numbers of items to return',
    },
  },
};
