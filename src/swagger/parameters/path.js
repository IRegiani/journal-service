module.exports = {
  tag: {
    name: 'tag',
    in: 'path',
    required: true,
    schema: {
      type: 'string',
      example: 'Liz',
    },
  },
  uid: {
    name: 'uid',
    in: 'path',
    required: true,
    schema: {
      type: 'string',
      format: 'uuid',
      example: '76aad0f8-5ac8-4028-b148-827551af23f7',
    },
  },
};
