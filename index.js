const config = require('config');
// eslint-disable-next-line security/detect-child-process
const gitCommit = require('child_process').execSync('git rev-parse HEAD').toString().trim();

const logger = require('./src/utils/logger').initLogger({ name: 'MAIN' });

const environment = process.env.NODE_ENV || 'local';
const Service = require('./src/app');

const init = async () => {
    try {
        logger.info(`Starting Service: environment:${environment} commit:${gitCommit} `);
        const service = new Service(logger, gitCommit);
        await service.init();

        const { port, version } = config.get('server');

        service.listen(port, (error) => {
            if (error) throw error;
            logger.success(`Service started 🚀 See routes at: http://localhost:${port}${version}/documentation \n`);
        });
    } catch (error) {
        logger.error(`Error initializing Service: ${error.message}`, error);

        process.exitCode = 1;
    }
};

init();
