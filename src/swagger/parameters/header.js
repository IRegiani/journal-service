module.exports = ({
  lastModified: {
    name: 'last-modified',
    in: 'header',
    schema: {
      type: 'string',
      format: 'date-time',
      example: '2021-05-05T00:44:10.714Z',
      description: 'Saves the original file creation date',
    },
  },
});
