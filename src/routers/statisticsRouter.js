const StatisticsRouter = require('express').Router();
const AuthorizationController = require('../controllers/authorizationController')();

module.exports = (options) => {
  const StatisticsController = require('../controllers/statisticsController')(options);

  StatisticsRouter.route('/statistics').get(AuthorizationController.authorize, StatisticsController.stats);

  return StatisticsRouter;
};
