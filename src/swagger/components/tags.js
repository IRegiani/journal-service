const tags = {
    type: 'array',
    items: {
        type: 'string',
        example: 'lzsi2',
        description: 'Used to categorize an entry or a set of entries by Journal',
    },
};

const tagList = {
    schema: {
        type: 'array',
        items: {
            type: 'object',
            properties: {
                name: {
                    type: 'string',
                    example: 'lzsi2',
                    description: 'Used as key to find this tag',
                },
                color: {
                    type: 'string',
                    example: '#9d32a8',
                    description: 'Just to save user personalized data',
                },
                description: {
                    type: 'string',
                    example: 'Beach travel with friends in february',
                    description: 'Used give more details regarding what the category represents',
                },
            },
        },
    },
};

module.exports = () => ({ tags, tagList });
