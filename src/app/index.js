const config = require('config');
const compression = require('compression');
const express = require('express');
const requestContext = require('express-http-context');
const helmet = require('helmet');
const cors = require('cors');
const swagger = require('swagger-ui-express');
const { StatusCodes } = require('http-status-codes');

// WIP Check basePath and https
// WIP Add second process later when processing or receiving videos

// Router
const IndexRouter = require('../routers/indexRouter');
// const AuthorizationRouter = require('../routers/authorizationRouter');

// Interceptors
// WIP: Add authorization interceptor
const RequestInterceptor = require('../interceptors/request');

class Service {
  constructor(logger, gitCommit, pid) {
    this.gitCommit = gitCommit;
    this.logger = logger;
    this.initDate = new Date().toISOString();
    this.pid = pid;
  }

  async init() {
    // create log file?
    // await this.logger.createFile();
    this._app = express();

    this._app.use(compression());
    this._app.use(helmet());
    this._app.use(express.urlencoded({ extended: true }));
    this._app.use(express.json());
    this._app.use(cors(config.get('cors')));
    this._app.use(requestContext.middleware);
    this._app.set('trust proxy', true);

    // add db instance as middleware
    // const databaseInstance = await this.startDB();
    // this._app.use((request, response, next) => { response.locals.db = databaseInstance; next(); });

    this._app.use(RequestInterceptor());

    // Routers
    const initConfig = { gitCommit: this.gitCommit, initDate: this.initDate };
    this._app.use(IndexRouter(initConfig));
    // this._app.use(AuthorizationRouter());

    const swaggerContent = require('../swagger')();
    this._app.use('/documentation', swagger.serve, swagger.setup(swaggerContent));

    // eslint-disable-next-line no-unused-vars
    const errorHandler = (err, req, res, next) => {
      this.logger.error(`Unhandled error in ${req.path}`, { method: req.method, path: req.path, err });
      res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ message: err.message });
    };

    this._app.use(errorHandler);
  }

  async listen(...params) {
    this._app.listen(...params);
  }
}

module.exports = Service;
