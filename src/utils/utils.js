const crypto = require('crypto');
const { StatusCodes } = require('http-status-codes');

const { CustomError } = require('./error')();

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

module.exports = {
  createHash,
  getFileName,
  getObjectValuesByKeys,
  getObjectWithoutValuesByKeys,
  addNewItemOrCreateArray,
  updateProperties,
};
