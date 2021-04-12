const config = require('config');
const requestContext = require('express-http-context');
const { Signale } = require('signale');

// WIP: Add write to log file

const levels = ['info', 'error', 'success', 'warn', 'debug', 'complete'];
const options = { types: { debug: { color: 'magenta', label: 'debug', logLevel: 'debug' } } };

const errorHasStack = (error) => error instanceof Error && error.stack;

const formatter = new Signale(options);
formatter.config({ displayTimestamp: true, uppercaseLabel: true });

const createLogPrefixAndSuffix = (metadata, shouldShowMetadata, extraSuffix) => {
  const reqId = requestContext.get('reqId');
  const username = requestContext.get('username') || 'N/A';

  const getSuffixFormat = (suffix = '') => {
    if (!shouldShowMetadata) return suffix;
    if (errorHasStack(metadata)) return `\n${metadata.stack}${suffix}`;
    if (typeof metadata !== 'object') return metadata && `${metadata}${suffix}`;
    if (typeof metadata === 'object') {
      return `${Object.entries(metadata).reduce((acc, [key, value]) => acc.concat(errorHasStack(value) ? `\n${value.stack}` : `${key}=${value} `), '')}${suffix}`;
    }
    return suffix;
  };

  return { prefix: { reqId, username }, suffix: getSuffixFormat(extraSuffix) };
};

const handleLog = (level, shouldShowMetadata, name) => (message, metadata, extraSuffix) => {
  const { prefix: { username, reqId }, suffix } = createLogPrefixAndSuffix(metadata, shouldShowMetadata, extraSuffix);
  const prefixToLog = `[${reqId ? ` reqId: ${reqId} - ${username} ` : ''}]`;

  formatter.scope(name)[level]({ message, prefix: prefixToLog, suffix });
};

const initLogger = ({ name, verbose }) => {
  const shouldShowMetadata = typeof verbose === 'undefined' ? config.get('logger.verbose') : verbose;

  const logger = levels.reduce((finalLogger, level) => ({ ...finalLogger, [level]: handleLog(level, shouldShowMetadata, name) }), {});
  logger.flush = async () => { }; // write to file here too
  logger.logToFile = () => { };

  return logger;
};

module.exports = {
  initLogger,
};
