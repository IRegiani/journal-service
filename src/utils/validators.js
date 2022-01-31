const { StatusCodes } = require('http-status-codes');
const { CustomError } = require('./error')();
// const logger = require('./logger').initLogger({ name: 'UTILS' });

const isIsoDateString = (string) => {
    if (!/\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}.\d{3}Z/.test(string)) return false;

    const date = new Date(string);
    let isDate;

    try {
        isDate = date.toISOString() === string;
    } catch {
        isDate = false;
    }

    return isDate;
};

/**
 * @description Validates if a series of headers is present on the request, if they aren't an error is thrown
 * @param {object} request the request itself
 * @param {object} [headers={ 'content-type': 'application/json' }]
 */
const validateHeaders = (request, headers = { 'content-type': 'application/json' }) => {
    const requestHeaders = Object.entries(request.headers).reduce((acc, [headerName, headerValue]) => ({ ...acc, [headerName.toLowerCase()]: headerValue }), {});
    Object.entries(headers).forEach(([headerName, headerValue]) => {
        // eslint-disable-next-line security/detect-object-injection
        if (!requestHeaders[headerName]?.includes(headerValue)) {
            if (headerName === 'content-type' || headerName === 'content-encoding') {
                throw new CustomError(`Invalid header value *${headerValue}* for ${headerName}`, StatusCodes.UNSUPPORTED_MEDIA_TYPE);
            }
            throw new CustomError(`Missing or invalid required header: ${headerName}`, StatusCodes.BAD_REQUEST); // this could be 422, but the body is not validated yet
        }
    });
};

const isDateOperatorValid = (operator) => ['>', '<', '..', '>=', '<='].includes(operator);
// checks if all brackets were closed and if the values are expected
const validateQueryStringOperators = (query, argName) => {
    if ([...query.matchAll(/\[|\]/g)].length % 2 === 0
        && [...query.matchAll(/\[(.*?)\]/g)].some((op) => !['NOT', 'AND', 'OR'].includes(op))) {
        throw new CustomError(`Invalid logic operator in queryParam: ${argName}`, StatusCodes.BAD_REQUEST);
    }
};

module.exports = {
    isIsoDateString,
    validateHeaders,
    isDateOperatorValid,
    validateQueryStringOperators,
};
