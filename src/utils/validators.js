const { StatusCodes } = require('http-status-codes');
const { CustomError } = require('./error')();
// const logger = require('./logger').initLogger({ name: 'UTILS' });

const isIsoDateString = (string) => {
  if (!/\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}.\d{3}Z/.test(string)) return false;

  const date = new Date(string);
  let isDate;

  try {
    isDate = date.toISOString() === string;
  } catch {
    isDate = false;
  }

  return isDate;
};

const validateHeaders = (request, headers = { 'content-type': 'application/json' }) => {
  const requestHeaders = Object.entries(request.headers).reduce((acc, [headerName, headerValue]) => ({ ...acc, [headerName.toLowerCase()]: headerValue }), {});
  if (Object.entries(headers).some(([header, value]) => !requestHeaders[header]?.includes(value))) {
    // WIP refactor:
    // if (header === 'content-type' || 'content-encoding') throw new CustomError('Invalid header value', StatusCodes.UNSUPPORTED_MEDIA_TYPE);
    throw new CustomError('Invalid header value', StatusCodes.UNSUPPORTED_MEDIA_TYPE);
  }
};

module.exports = {
  isIsoDateString,
  validateHeaders,
};
