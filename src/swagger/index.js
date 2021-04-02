const config = require('config');

module.exports = () => {
  const swaggerDocumentation = {
    openapi: '3.0.3',
    info: {
      title: 'Journal Service',
      description: 'Handles journals in purely text-based database',
      version: '1.0.0',
    },
    servers: [{ url: `http://localhost:${config.get('server.port')}/${config.get('server.version')}` }],
    // security
    paths: require('./paths')(),
  };

  return swaggerDocumentation;
};
