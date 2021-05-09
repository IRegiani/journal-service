const { FILE_TYPES } = require('../../utils/constants');

module.exports = () => ({
  type: 'object',
  properties: {
    uid: {
      type: 'string',
      format: 'uuid',
      example: '76aad0f8-5ac8-4028-b148-827551af23f7',
    },
    size: {
      type: 'number',
      example: 43563743,
      description: 'Total file size in bytes',
    },
    type: {
      type: 'string',
      example: FILE_TYPES[0],
      enum: FILE_TYPES,
      description: 'Type of the file sent',
    },
    createdAt: {
      type: 'string',
      format: 'date-time',
      example: '2021-05-08T23:56:15.585Z',
      description: 'Date of when this file was uploaded',
    },
    originalDate: {
      type: 'string',
      format: 'date-time',
      example: '2021-05-08T23:56:15.585Z',
      description: 'Optional field of when the file was created, before being uploaded',
    },
  },
});
