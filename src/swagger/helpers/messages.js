const createMessage = (message) => ({
  'application/json': {
    schema: {
      type: 'object',
      properties: {
        message: {
          type: 'string',
          example: message,
        },
      },
    },
  },
});

module.exports = ({ createMessage });
