const { tags } = require('./tags')();

const fileEntity = {
    type: 'string',
    format: 'uuid',
    example: '76aad0f8-5ac8-4028-b148-827551af23f7',
};

module.exports = () => ({
    type: 'object',
    properties: {
        description: {
            type: 'string',
            description: 'Entry description based on text. Minimum field required to create an entry',
            example: 'First day in my trip to the beach...',
        },
        createdAt: {
            type: 'string',
            format: 'date-time',
            example: '2021-05-08T23:56:15.585Z',
        },
        fileUids: {
            type: 'array',
            items: fileEntity,
        },
        fileEntry: {
            ...fileEntity,
            description: 'Populated when this an video entry. Is also present in the fileUids field',
        },
        tags,
        hash: {
            type: 'string',
            example: '2ece5fc523f9dffdaf8f5686bd52ac3f558f4b51ebef2fb5f065dca4d4019ce1',
            description: 'Based upon entry content. FileEntry or tags fields does not alter its value',
        },
    },
});
