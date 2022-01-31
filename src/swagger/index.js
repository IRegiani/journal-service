const config = require('config');

// TODO: Improve styling

module.exports = () => {
    const swaggerDocumentation = {
        openapi: '3.0.3',
        info: {
            title: 'Journal Service',
            description: 'Handles journals with files in a text-based database',
            version: '1.0.0',
        },
        servers: [{ url: `http://localhost:${config.get('server.port')}${config.get('server.version')}` }],
        // security
        paths: require('./paths')(),
    };

    return swaggerDocumentation;
};
