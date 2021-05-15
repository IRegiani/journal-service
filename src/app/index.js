const config = require('config');
const compression = require('compression');
const express = require('express');
const requestContext = require('express-http-context');
const helmet = require('helmet');
const cors = require('cors');
const skipper = require('skipper');
const swagger = require('swagger-ui-express');
const { StatusCodes } = require('http-status-codes');
const StormDB = require('stormdb');

// Router
const IndexRouter = require('../routers/indexRouter');
// const AuthorizationRouter = require('../routers/authorizationRouter');
const JournalRouter = require('../routers/journalRouter');
const TagRouter = require('../routers/tagRouter');
const StatisticsRouter = require('../routers/statisticsRouter');

// Interceptors
const RequestInterceptor = require('../interceptors/request');

class Service {
  constructor(logger, gitCommit) {
    this.gitCommit = gitCommit;
    this.logger = logger;
    this.initDate = new Date().toISOString();
  }

  async init() {
    this._app = express();

    this._app.use(compression());
    this._app.use(helmet());
    this._app.use(express.urlencoded({ extended: true }));
    this._app.use(express.json());
    this._app.use(cors(config.get('cors')));
    this._app.use(requestContext.middleware);
    this._app.set('trust proxy', true);

    // add db instance in the response
    const databaseInstance = await this.startDB();
    this._app.use((request, response, next) => { response.locals.db = databaseInstance; next(); });

    this._app.use(RequestInterceptor());
    this._app.use(skipper()); // this one is screwing the request context

    const initConfig = { gitCommit: this.gitCommit, initDate: this.initDate };
    const apiVersion = config.get('server.version');

    // Routers
    this._app.use(apiVersion, IndexRouter(initConfig));
    // this._app.use(AuthorizationRouter());
    this._app.use(apiVersion, JournalRouter());
    this._app.use(apiVersion, TagRouter());
    this._app.use(apiVersion, StatisticsRouter(initConfig));

    const swaggerContent = require('../swagger')();
    this._app.use(`${apiVersion}/documentation`, swagger.serve, swagger.setup(swaggerContent, { explorer: true }));

    // eslint-disable-next-line no-unused-vars
    const errorHandler = (err, req, res, next) => {
      this.logger.error(`Unhandled error in ${req.path}`, { method: req.method, path: req.path, err });
      res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ message: err.message });
    };

    this._app.use(errorHandler);
    this._app.use((req, res) => res.status(StatusCodes.NOT_FOUND).json({ message: 'Route not found' }));
  }

  async listen(...params) {
    this._app.listen(...params);
  }

  async startDB() {
    // eslint-disable-next-line new-cap
    const engine = new StormDB.localFileEngine('./journal-db', { async: true });
    this._db = new StormDB(engine);

    require('../services/fileService')().checkPath();

    // set default db value if db is empty
    this._db.default({ users: {}, journals: [], files: {}, tags: { entry: [], journal: [] } });

    this.logger.info('Database ready');
    return this._db;
  }
}

module.exports = Service;
