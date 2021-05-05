const { TAG_TYPES } = require('../../utils/constants');

module.exports = {
  // wip to component?
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
      description: 'Unique identifier for an entity',
    },
  },
  index: {
    name: 'index',
    in: 'path',
    required: true,
    schema: {
      type: 'integer',
      example: 16,
      description: 'Describes the position of an entry inside a journal',
    },
  },
  type: {
    name: 'type',
    in: 'path',
    required: true,
    schema: {
      type: 'string',
      enum: Object.values(TAG_TYPES),
      example: TAG_TYPES.entry,
      description: 'Indicates entity that the tag references to',
    },
  },
};
