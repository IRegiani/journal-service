const { isAfter, isBefore, isSameDay } = require('date-fns');
const { StatusCodes } = require('http-status-codes');

const { isIsoDateString, isDateOperatorValid } = require('../utils/validators');
const { CustomError } = require('../utils/error')();

/**
 * @description Used inside a filter function to get a subset of items that can be inside a date range
 * or before or after date (exclusive or inclusive)
 *
 * @param {string} date Contains a ISO date, or a range or a date(s) with some operator
 * @param {string} dateField Where the date to compare to is located in object item
 * @returns {function(item)} receives an item, gets its date and returns true or false according to parameter date
 */
const filterByDate = (date, dateField) => (item) => {
    // eslint-disable-next-line security/detect-object-injection
    const dateItem = new Date(item[dateField]);
    const validateOperator = (operator) => { if (!isDateOperatorValid(operator)) throw new CustomError(`Invalid date operator: ${operator}`, StatusCodes.BAD_REQUEST); };

    if (isIsoDateString(date)) {
        return isSameDay(dateItem, new Date(date));
    }

    // single operator > or <
    if (date.length === 25) {
        const operator = date.substring(0, 1);
        validateOperator(operator);
        const beforeAfterDate = new Date(date.substring(1));
        return operator === '>' ? isAfter(dateItem, beforeAfterDate) : isBefore(dateItem, beforeAfterDate);
    }

    // double operator => or <=
    if (date.length === 26) {
        const operator = date.substring(0, 2);
        validateOperator(operator);
        const beforeOrAfterDate = new Date(date.substring(2));
        const isAfterOrBefore = operator === '=>' ? isAfter(dateItem, beforeOrAfterDate) : isBefore(dateItem, beforeOrAfterDate);
        return isAfterOrBefore || isSameDay(dateItem, beforeOrAfterDate);
    }

    const operator = date.substring(25, 26);
    if (operator !== '..') throw new CustomError(`Invalid date operator: ${operator}`, StatusCodes.BAD_REQUEST);
    const startDate = new Date(date.substring(0, 24));
    const endDate = new Date(date.substring(27));
    return (isAfter(dateItem, startDate) && isBefore(dateItem, endDate)) || isSameDay(dateItem, startDate) || isSameDay(dateItem, endDate);
};

const filterByOperator = (query, selector) => (item) => {
    const currentValue = selector(item);
    const queries = query.split(',');
    const requiredValues1 = queries.filter((q) => !q.includes('['));
    const negatedValues = queries.filter((q) => q.includes('[NOT]')).map((v) => v.replace('[NOT]', ''));
    const orValues = queries.filter((q) => q.includes('[OR]'));
    const requiredValues2 = queries.filter((q) => q.includes('[AND]'));
    const requiredValues = [...requiredValues1, ...requiredValues2].map((v) => v.replace('[AND]', ''));

    // Could use the word boundary marker: \b
    // https://stackoverflow.com/questions/21448139/match-list-of-words-without-the-list-of-chars-around
    // eslint-disable-next-line security/detect-non-literal-regexp
    const orRegex = new RegExp(`(?:^|(?<= ))(${orValues.join('|').replaceAll('[OR]')})(?:(?= )|$)`);

    return negatedValues.some((v) => currentValue.includes(v))
        && requiredValues.some((v) => currentValue.includes(v))
        && orRegex.test(currentValue);
};

const filterByMetadata = () => {

};

module.exports = {
    filterByDate,
    filterByOperator,
    filterByMetadata,
};
