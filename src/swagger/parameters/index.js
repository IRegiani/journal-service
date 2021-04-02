const queryParameters = require('./query');
const pathParameters = require('./path');

module.exports = () => ({ pathParameters, queryParameters });
