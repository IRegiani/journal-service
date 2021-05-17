const FileRouter = require('express').Router();
const FileController = require('../controllers/fileController')();
const AuthorizationController = require('../controllers/authorizationController')();

module.exports = () => {
  FileRouter.use('/file', AuthorizationController.authorize);

  FileRouter.route('/file/:uid').get(FileController.getFile);
  FileRouter.route('/file/:uid/mediaInfo').get(FileController.getFileMediaInfo);

  return FileRouter;
};
