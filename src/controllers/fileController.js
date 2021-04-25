/* eslint-disable no-unused-vars */
const { StatusCodes } = require('http-status-codes');

const logger = require('../utils/logger').initLogger({ name: 'FILE CONTROLLER' });
const { CustomError, handleError, isExpectedError } = require('../utils/error')();

module.exports = () => {
  const FileController = {
    async getAttachment(request, response, next) {
      const { uid } = request.params;
      return response.status(StatusCodes.CREATED).json();
    },
  };

  return FileController;
};
