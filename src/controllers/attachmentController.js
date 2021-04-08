/* eslint-disable no-unused-vars */
const { StatusCodes } = require('http-status-codes');

const logger = require('../utils/logger').initLogger({ name: 'JOURNAL CONTROLLER' });
const { CustomError, handleError, isExpectedError } = require('../utils/error')();

module.exports = () => {
  const AttachmentController = {
    async addAttachment(request, response, next) {
      const { body: { journalUid, entry } } = request;
      return response.status(StatusCodes.CREATED).json();
    },
  };

  return AttachmentController;
};
