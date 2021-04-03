const config = require('config');
const gitCommit = require('child_process').execSync('git rev-parse HEAD').toString().trim();

const logger = require('./src/utils/logger').initLogger({ name: 'MAIN' });

const environment = process.env.NODE_ENV || 'local';
const Service = require('./src/app');

const init = async () => {
  try {
    logger.info(`Starting Service: environment:${environment} commit:${gitCommit} `);
    const service = new Service(logger, gitCommit);
    await service.init();

    const port = config.get('server.port');

    service.listen(port, (error) => {
      if (error) throw error;
      logger.success(`Service started on http://localhost:${port} 🚀\n`);
    });
  } catch (error) {
    logger.error(`Error initializing Service: ${error.message}`, error);
    await logger.flush();

    process.exit(1);
  }
};

init();
