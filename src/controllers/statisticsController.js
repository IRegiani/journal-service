const os = require('os');
const v8 = require('v8');
const logger = require('../utils/logger').initLogger({ name: 'STATISTICS CONTROLLER' });

module.exports = (config) => {
    const StatisticsController = {
        async stats(request, response) {
            logger.info('Getting statistics');

            const responseBody = {
                ...config,
                uptime: process.uptime(),
                platform: process.platform,
                hostname: os.hostname(),
                ...process.memoryUsage(),
                rss2: process.memoryUsage.rss(),
                ...process.resourceUsage(),
                cpuUsage: process.cpuUsage(),
                report: process.report,
                loadAverage: os.loadavg(),
                arch: os.arch(),
                cpus: os.cpus(),
                v8: v8.getHeapStatistics(),
            };
            return response.json(responseBody);
        },

    };

    return StatisticsController;
};
