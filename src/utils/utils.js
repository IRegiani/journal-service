const crypto = require('crypto');

const createHash = (string) => crypto.createHash('sha256').update(string).digest('hex');

const getFileName = (path) => path.substring(path.lastIndexOf('/') + 1);

const getObjectKeys = (obj, keys = []) => keys.reduce((acc, key) => ({ ...acc, [key]: obj[key] }), {});

const getObjectWithoutKeys = (obj, keys = []) => Object.entries(obj).reduce((acc, [key, value]) => (keys.includes(key) ? acc : ({ ...acc, [key]: value })), {});

const addNewItemOrCreateArray = (arr, newItem) => (arr ? [...arr, newItem] : [newItem]);

// Useful on patches. WIP: Refactor, maybe "delete" can be removed
const updateProperties = (originalObject, changes, allowedProperties) => {
  const newObject = { ...originalObject };
  Object.entries(changes).forEach(([key, value]) => {
    if (!allowedProperties || allowedProperties.includes(key)) {
      if (value === null) delete newObject[key];
      else newObject[key] = value;
    }
  });
  return newObject;
};

module.exports = {
  createHash,
  getFileName,
  getObjectKeys,
  getObjectWithoutKeys,
  addNewItemOrCreateArray,
  updateProperties,
};
