const { StatusCodes } = require('http-status-codes');
const { CustomError } = require('./error')();

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

const validateHeaders = (request, headers = { 'content-type': 'application/json' }) => Object.entries(headers)
  .forEach(([header, value]) => {
    if (!request.headers[header]?.includes(value)) throw new CustomError(`Invalid header value, expected ${value}`, StatusCodes.UNSUPPORTED_MEDIA_TYPE);
  });

module.exports = {
  isIsoDateString,
  validateHeaders,
};
