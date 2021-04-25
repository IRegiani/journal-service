const { StatusCodes } = require('http-status-codes');
const requestContext = require('express-http-context');

const logger = require('../utils/logger').initLogger({ name: 'AUTHORIZATION CONTROLLER' });
const { CustomError, handleError, isExpectedError } = require('../utils/error')();

module.exports = () => {
  const AuthorizationController = {
    async login(request, response, next) {
      const { body: { username, password } } = request;
      const { db } = response.locals;

      try {
        logger.info('Trying to login', { username });

        if (!username) throw new CustomError('Missing username', StatusCodes.BAD_REQUEST);
        if (!password) throw new CustomError('Missing password', StatusCodes.BAD_REQUEST);

        // TODO: call authorization service to handle authentication logic
        // DB example
        const doc = await db.doc('logins/history');
        const oldLogins = await doc.get();
        const logins = (oldLogins.data() && oldLogins.data().entries) || [];

        const newLogin = { username, timestamp: new Date() };

        const newEntry = [...logins, newLogin];
        await doc.update({ entries: newEntry });

        return response.json({ message: 'Success', logins: newEntry });
      } catch (error) {
        if (isExpectedError(error)) return handleError(response, error, logger);

        return next(error);
      }
    },

    async authorize(request, response, next) {
      try {
        logger.info('Checking authorization');

        const username = 'dummy-user';
        request.user = { username, uid: 'bac41e52-46a8-4d93-b700-15eb75e90a24' };
        requestContext.set('username', username);

        return next();
      } catch (error) {
        if (isExpectedError(error)) return handleError(response, error, logger);

        return next(error);
      }
    },
  };

  return AuthorizationController;
};
