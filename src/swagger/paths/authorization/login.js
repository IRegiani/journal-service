module.exports = () => {
    const fullUser = require('../../components/user')();

    const requestBody = {
        schema: {
            type: 'object',
            properties: {
                email: {
                    type: 'string',
                    format: 'email',
                    example: 'some@email.com',
                },
                password: {
                    type: 'strig',
                    format: 'password',
                    example: 'somePassword',
                },
            },
        },
    };

    return {
        post: {
            tags: ['Authorization'],
            summary: 'Authenticates a user',
            operationId: 'login',
            // security: true, TODO
            requestBody: {
                required: true,
                description: 'If email and password are correct, returns user data',
                content: {
                    'application/json': requestBody,
                },
            },
            responses: {
                200: {
                    description: 'OK',
                    content: { 'application/json': fullUser },
                },
            },
        },
    };
};
