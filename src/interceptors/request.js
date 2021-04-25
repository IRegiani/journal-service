const onFinished = require('on-finished');
const requestContext = require('express-http-context');
const logger = require('../utils/logger').initLogger({ name: 'REQUEST INTERCEPTOR' });

module.exports = () => {
  const beforeRequest = () => {
    // WIP: request context is undefined when no file is sent
    // console.log('here, before!');
    const reqId = Math.random().toString(36).substr(2, 9);
    requestContext.set('reqId', reqId);
    requestContext.set('initTime', Date.now());
    // console.log('requestContext', requestContext.get('initTime'));
    // requestContext.set('forwardList', request.get('X-Forwarded-For'));
  };

  const afterFinished = (request, response) => {
    // console.log('here, after!', requestContext.get('initTime'));
    const ip = request.ip || request.connection.remoteAddress;
    const userAgent = request.get('User-Agent');
    const status = response.statusCode;
    const { method, url } = request;
    const duration = Date.now() - requestContext.get('initTime');

    let loggerLevel = 'complete';
    if (status >= 500 && status < 600) loggerLevel = 'error';
    if (status >= 400 && status < 500) loggerLevel = 'warn';

    // const forwardList = requestContext.get('forwardList');

    logger[loggerLevel]('Request completed', { status, method, url, userAgent, ip, duration }, '\n');
  };

  const RequestInterceptor = (request, response, next) => {
    beforeRequest(request);
    onFinished(response, () => afterFinished(request, response));
    next();
  };

  return RequestInterceptor;
};
