const { ATTACHMENT_TYPES } = require('../../utils/constants');

module.exports = () => ({
  type: 'object',
  properties: {
    type: {
      type: 'string',
      example: 'video',
      enum: ATTACHMENT_TYPES,
    },
    size: {
      type: 'string',
    },
    url: {
      type: 'string',
      format: 'uri',
    },
    uid: {
      type: 'string',
      format: 'uuid',
    },
    journal: {
      type: 'string',
      format: 'uuid',
    },
    hash: {
      type: 'string',
    },
  },
});
