module.exports = ({
  creationDate: {
    name: 'creation-date',
    in: 'header',
    description: 'Saves the original file creation date, custom header',
    schema: {
      type: 'string',
      format: 'date-time',
      example: '2021-05-05T00:44:10.714Z',
    },
  },
  // Responses
  totalCount: {
    name: 'total-count',
    description: 'The total amount of resources available to query',
    schema: { type: 'integer' },
  },
  totalPages: {
    name: 'total-pages',
    description: 'The total number of pages considering the limit query parameter',
    schema: { type: 'integer' },
  },
  previousOffset: {
    name: 'prev-offset',
    description: 'The necessary offset query parameter in order to get the previous set of resources, considering the same limit and input query',
    schema: { type: 'integer' },
  },
  nextOffset: {
    name: 'next-offset',
    description: 'The necessary offset query parameter in order to get the next set of resources, considering the same limit and input query',
    schema: { type: 'integer' },
  },
});
