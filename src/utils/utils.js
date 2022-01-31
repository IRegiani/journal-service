/* eslint-disable no-multiple-empty-lines */
const crypto = require('crypto');
const lodash = require('lodash');
const { StatusCodes } = require('http-status-codes');

const { CustomError } = require('./error')();
const logger = require('./logger').initLogger({ name: 'UTILS' });


const createHash = (string) => crypto.createHash('sha256').update(string).digest('hex');

const getFileName = (path) => path.substring(path.lastIndexOf('/') + 1);

// eslint-disable-next-line security/detect-object-injection
const getObjectValuesByKeys = (obj, keys = []) => keys.reduce((acc, key) => ({ ...acc, [key]: obj[key] }), {});

const getObjectWithoutValuesByKeys = (obj, keys = []) => Object.entries(obj).reduce((acc, [key, value]) => (keys.includes(key) ? acc : ({ ...acc, [key]: value })), {});

const addNewItemOrCreateArray = (arr, newItem) => (arr ? [...arr, newItem] : [newItem]);

/**
 * @description Perform an set of changes on the properties of an object, useful on PATCH according to RFC7396.
 * Properties are deleted new null is used and the new value is the one on the change object, even if the format is invalid.
 * Basic validation is performed on the properties contained in the changes object
 *
 * @param {object} originalObject Unmodified object that is going to be subject to changes, usually as it's recorded in the DB
 * @param {string|array|object} originalObject.key Object properties
 * @param {object} changes Represents what is going to be changed in the original object
 * @param {string|array|object} changes.key Object properties
 * @param {Array<String>=} allowedProperties List of fields that can be modified, anything different from that list is ignored. If not used everything can be added to the object
 * @param {function(string, any): boolean} formatCheckCB Validator to make sure that the new object only contains expected formats.
 * Null is always a valid format, and if allowedProperties is present, the keys are filtered by it
 * @returns {object} The updated version of the provided original object
 */
const updateProperties = (originalObject, changes, allowedProperties, formatCheckCB) => {
    const forbiddenValues = ['', 'null', 'undefined'];

    const hasFieldsToUpdate = allowedProperties ? Object.keys(changes).filter((key) => allowedProperties.includes(key)).length > 0 : true;
    if (!hasFieldsToUpdate) throw new CustomError('No properties to update', StatusCodes.BAD_REQUEST);

    const newObject = { ...originalObject };
    Object.entries(changes).forEach(([key, value]) => {
        if (forbiddenValues.includes(value)) throw new CustomError(`Invalid value to update found in ${key}`, StatusCodes.BAD_REQUEST);
        const hasInvalidFormat = formatCheckCB && value !== null && (allowedProperties ? allowedProperties.includes(key) : true) && !formatCheckCB(key, value);
        if (hasInvalidFormat) throw new CustomError(`Invalid value ${typeof value} format in key ${key}`, StatusCodes.BAD_REQUEST);
        if (!allowedProperties || allowedProperties.includes(key)) {
            // eslint-disable-next-line security/detect-object-injection
            if (value === null) newObject[key] = undefined;
            // eslint-disable-next-line security/detect-object-injection
            if (value) newObject[key] = value;
        }
    });
    return newObject;
};

/**
 * @description Paginates a list of items
 *
 * @param {object} paginationParams Contains the pagination properties
 * @param {number=} paginationParams.limit The amount of items allowed per page
 * @param {number=0} paginationParams.offset Shift the page by some amount of items
 * @param {array} items List of items to be paginated
 * @returns {object} response
 * @returns {array} response.list
 * @returns {object} response.headers
 * @returns {integer} response.headers.total-count
 */
const paginateItems = ({ limit = 10, offset = 0 }, items) => {
    if (!limit && !offset) return { list: items };
    const paginatedItems = items.slice(offset, offset + limit);
    const headers = {
        'total-count': items.length,
        'total-pages': Math.ceil(items.length / (limit || items.length)),
        // 'Access-Control-Expose-Headers': 'total-count, total-pages',
    };

    logger.debug('Paginating items', { offset, limit, size: items.length });

    if (limit !== items.length) {
        const previous = offset - limit;
        const next = offset + limit;

        if (offset < items.length) {
            if (previous < 0) headers['previous-offset'] = 0;
            else headers['previous-offset'] = previous;

            // headers['Access-Control-Expose-Headers'] += ', previous-offset';
        }

        if (next < items.length) {
            headers['next-offset'] = next;
            // headers['Access-Control-Expose-Headers'] += ', next-offset';
        }
    }

    return { list: paginatedItems, headers };
};

const sortItems = ({ sortBy, order = 'asc' }, items, selectors) => {
    logger.debug('Sorting items', { sortBy, order });

    if (!Object.keys(selectors).includes(sortBy)) throw new CustomError(`Invalid sortBy value: ${sortBy}`);

    // eslint-disable-next-line security/detect-object-injection
    const sortedItems = lodash.sortBy(items, selectors[sortBy], [order]);

    return sortedItems;
};


module.exports = {
    createHash,
    getFileName,
    getObjectValuesByKeys,
    getObjectWithoutValuesByKeys,
    addNewItemOrCreateArray,
    updateProperties,
    paginateItems,
    sortItems,
};
