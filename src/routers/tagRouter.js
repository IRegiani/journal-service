const TagRouter = require('express').Router();
const TagController = require('../controllers/tagController')();
const AuthorizationController = require('../controllers/authorizationController')();

module.exports = () => {
  TagRouter.use('/tag', AuthorizationController.authorize);

  TagRouter.route('/tag/:type')
    .get(TagController.getTags)
    .post(TagController.createTag);

  TagRouter.route('/tag/:type/:tag')
    .get(TagController.getTag)
    .patch(TagController.updateTag)
    .delete(TagController.deleteTag);

  return TagRouter;
};
