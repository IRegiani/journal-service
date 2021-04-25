const crypto = require('crypto');

const createHash = (string) => crypto.createHash('sha256').update(string).digest('hex');

const getFileName = (path) => path.substring(path.lastIndexOf('/') + 1);

const getObjectKeys = (keys = [], obj) => keys.reduce((acc, key) => ({ ...acc, [key]: obj[key] }), {});

const addNewItemOrCreateArray = (arr, newItem) => (arr ? [...arr, newItem] : [newItem]);

// Useful on patches
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
  addNewItemOrCreateArray,
  updateProperties,
};
