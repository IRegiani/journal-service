module.exports = () => {
  const AuthorozationRouter = require('express').Router();
  const AuthorizationController = require('../controllers/authorizationController')();

  AuthorozationRouter.route('/login').post(AuthorizationController.login);

  return AuthorozationRouter;
};
