const dateRangeExamples = `
    - 2021-05-22T19:00:06.484Z
    - >2021-05-22T19:00:06.484Z
    - <=2021-05-22T19:00:06.484Z
    - 2021-05-22T19:00:06.484Z..2021-01-22T19:00:06.484Z
  `;
const dateRangeDescription = (dateType) => `Filters by ${dateType} in ISO8601 format, supporting date range operators: \`..\`, \`>\`,\`<\`, \`>=\`, \`<=\`
 \n\nExamples: \n\n${dateRangeExamples}`;

module.exports = {
  offset: {
    in: 'query',
    name: 'offset',
    description: 'The number of items to skip before starting to collect the result set',
    schema: {
      type: 'integer',
      default: 0,
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
  sortBy: {
    in: 'query',
    name: 'sortBy',
    description: 'Sorts the results',
    schema: {
      type: 'string',
      default: 'timestamp',
      enum: ['createdAt', 'timestamp', 'tag', 'entryTag', 'fileAmount', 'entryAmount', 'updateHistory'],
    },
  },
  order: {
    in: 'query',
    name: 'order',
    description: 'Orders the results by numerical, alphabetical or match count',
    schema: {
      type: 'string',
      default: 'asc',
      enum: ['asc', 'desc'],
    },
  },
  // https://docs.github.com/en/rest/reference/search#constructing-a-search-query
  // https://docs.github.com/en/github/searching-for-information-on-github/getting-started-with-searching-on-github/understanding-the-search-syntax
  search: {
    in: 'query', // improve this
    name: 'search',
    description: 'Filter journals that contains at entry description with the designed search values. Supports logic operators, defaulting to AND operator',
    schema: {
      type: 'string',
      example: 'lake,moon,[NOT]year,sunny day',
    },
  },
  tag: {
    in: 'query', // improve this
    name: 'tag',
    description: 'Filter journals by tags. Supports logic operators, defaulting to AND operator',
    schema: {
      type: 'string',
      example: 'tag1,[NOT]tag2,tag3[OR]tag4',
    },
  },
  date: {
    in: 'query',
    name: 'date',
    description: dateRangeDescription('creation date'),
    schema: {
      type: 'string',
      example: '2021-05-22T19:00:06.484Z',
    },
  },
  timestamp: {
    in: 'query',
    name: 'timestamp',
    description: dateRangeDescription('timestamp'),
    schema: {
      type: 'string',
      example: '2021-05-22T19:00:06.484Z..2021-01-22T19:00:06.484Z',
    },
  },
  entryDetails: {
    in: 'query', // improve this
    name: 'entryDetails',
    description: 'Filters by entry details: contains attachment, fileEntry, fileMetadata',
    schema: {
      type: 'string',
      example: '[NOT]attachment,fileEntry[AND]fileMetadata(codec=HEVC,duration=>100,size=>1000,extension=mkv)',
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
