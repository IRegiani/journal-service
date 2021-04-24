const { StatusCodes } = require('http-status-codes');

const DEFAULT_ERROR_TYPE = 'OPERATIONAL_ERROR_TYPE';

class CustomError extends Error {
  constructor(message, responseCode, type) {
    super();
    this.message = message;
    this.responseCode = responseCode || StatusCodes.INTERNAL_SERVER_ERROR;
    this.customError = type || DEFAULT_ERROR_TYPE;
  }
}

// Most likely, this is an Operational Error
const handleError = (response, error, logger, showErrorStack = false) => {
  const { responseCode, message } = error;
  const errorToLog = showErrorStack ? error : undefined;

  logger.warn(message, errorToLog);

  return response.status(responseCode).json({ message });
};

const isExpectedError = (error, types = []) => error.customError && [...types, DEFAULT_ERROR_TYPE].some((type) => type === error.customError);

module.exports = () => ({
  CustomError,
  handleError,
  isExpectedError,
});
