module.exports = () => {
    const AuthorizationRouter = require('express').Router();
    const AuthorizationController = require('../controllers/authorizationController')();

    AuthorizationRouter.route('/login').post(AuthorizationController.login);

    return AuthorizationRouter;
};
