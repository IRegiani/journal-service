module.exports = (options) => {
  const IndexRouter = require('express').Router();
  const IndexController = require('../controllers/indexController')(options);

  IndexRouter.route('/').get(IndexController.index);

  return IndexRouter;
};
