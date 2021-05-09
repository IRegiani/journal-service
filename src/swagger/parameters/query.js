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
    description: 'he numbers of items to return',
    schema: {
      type: 'integer',
      default: 10,
    },
  },
};
