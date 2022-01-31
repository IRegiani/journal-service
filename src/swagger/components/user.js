const user = {
    schema: {
        type: 'object',
        properties: {
            property1: {
                type: 'string',
                example: 'string',
            },
        },
    },
};

module.exports = () => user;
