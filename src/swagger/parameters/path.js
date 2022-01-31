const { TAG_TYPES } = require('../../utils/constants');
const { tags } = require('../components/tags')();

module.exports = {
    tag: {
        name: 'tag',
        in: 'path',
        required: true,
        description: tags.items.description,
        schema: tags.items,
    },
    uid: {
        name: 'uid',
        in: 'path',
        required: true,
        description: 'Unique identifier for an entity',
        schema: {
            type: 'string',
            format: 'uuid',
            example: '76aad0f8-5ac8-4028-b148-827551af23f7',
        },
    },
    index: {
        name: 'index',
        in: 'path',
        required: true,
        description: 'Describes the position of an entry inside a journal',
        schema: {
            type: 'integer',
            example: 16,
        },
    },
    type: {
        name: 'type',
        in: 'path',
        required: true,
        description: 'Indicates the entity that the tag references',
        schema: {
            type: 'string',
            enum: Object.values(TAG_TYPES),
            example: TAG_TYPES.entry,
        },
    },
};
