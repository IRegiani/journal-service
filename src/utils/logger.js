const config = require('config');
const requestContext = require('express-http-context');
const { Signale } = require('signale');

// TODO: Add write to file errors

const levels = ['info', 'error', 'success', 'warn', 'debug', 'complete'];
const options = { types: { debug: { color: 'magenta', label: 'debug', logLevel: 'debug' } } };

const errorHasStack = (error) => error instanceof Error && error.stack;

const formatter = new Signale(options);
formatter.config({ displayTimestamp: true, uppercaseLabel: true });

const createLogPrefixAndSuffix = (metadata, shouldShowMetada) => {
  const reqId = requestContext.get('reqId');
  const username = requestContext.get('username');

  const getSuffixFormat = () => {
    if (!shouldShowMetada) return '';
    if (errorHasStack(metadata)) return `\n${metadata.stack}`;
    if (typeof metadata !== 'object') return metadata;
    if (typeof metadata === 'object') return Object.entries(metadata).reduce((acc, [key, value]) => acc.concat(errorHasStack(value) ? `\n${value.stack}` : `${key}=${value} `), '');
    return '';
  };

  return { prefix: { reqId, username }, suffix: getSuffixFormat() };
};

const handleLog = (level, shouldShowMetada, name) => (message, metadata) => {
  const { prefix: { username, reqId }, suffix } = createLogPrefixAndSuffix(metadata, shouldShowMetada);
  const prefixToLog = `[${reqId ? ` reqId: ${reqId} - ${username} ` : ''}]`;

  formatter.scope(name)[level]({ message, prefix: prefixToLog, suffix });
};

const initLogger = ({ name, verbose }) => {
  const shouldShowMetada = typeof verbose === 'undefined' ? config.get('logger.verbose') : verbose;

  const logger = levels.reduce((finalLogger, level) => ({ ...finalLogger, [level]: handleLog(level, shouldShowMetada, name) }), {});
  logger.flush = async () => {}; // write to file here too

  return logger;
};

module.exports = {
  initLogger,
};
