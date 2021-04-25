const config = require('config');
const fs = require('fs');
const requestContext = require('express-http-context');
const { Signale } = require('signale');
const { Writable } = require('stream');

const stream = [process.stderr];
if (config.get('logger.writeToFile')) {
  const fileStream = fs.createWriteStream('./log.txt', { flags: 'a' });
  fileStream.write(`\n
    ---------------------------------------------------------------------------------
    ------------------           ${new Date().toISOString()}          ------------------
    ---------------------------------------------------------------------------------
  \n`);

  const clearBuffer = (buffer) => {
    const newBuffer = [];
    const skippedIndex = [];
    // eslint-disable-next-line
    for (let [index, value] of buffer.entries()) {
      // 27 is the byte representation of the control character. TODO: This is also cutting the first letter of the logger level
      if (value === 27) skippedIndex.push(...[index, index + 1, index + 2, index + 3, index + 4]);
      if (!skippedIndex.includes(index)) newBuffer.push(buffer[index]);
    }
    return Buffer.from(newBuffer);
  };

  const write = (buffer, enc, cb) => { fileStream.write(clearBuffer(buffer)); cb(null); };
  const writableStream = new Writable({ write });
  stream.push(writableStream);
}

const levels = ['info', 'error', 'success', 'warn', 'debug', 'complete'];
const options = { types: { debug: { color: 'magenta', label: 'debug', logLevel: 'debug' } }, stream };

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
  const prefixToLog = `[${reqId ? ` reqId: ${reqId} - user: ${username} ` : ''}]`;

  formatter.scope(name)[level]({ message, prefix: prefixToLog, suffix });
};

const initLogger = ({ name, verbose }) => {
  const shouldShowMetadata = typeof verbose === 'undefined' ? config.get('logger.verbose') : verbose;

  const logger = levels.reduce((finalLogger, level) => ({ ...finalLogger, [level]: handleLog(level, shouldShowMetadata, name) }), {});
  if (!config.get('logger.debug')) logger.debug = () => { };

  return logger;
};

module.exports = {
  initLogger,
};
