const crypto = require('crypto');

const createHash = (string) => crypto.createHash('sha256').update(string).digest('hex');

const getFileName = (path) => path.substring(path.lastIndexOf('/') + 1);

const getObjectKeys = (keys = [], obj) => keys.reduce((acc, key) => ({ ...acc, [key]: obj[key] }), {});

const addNewItemOrCreateArray = (arr, newItem) => (arr ? [...arr, newItem] : [newItem]);

module.exports = {
  createHash,
  getFileName,
  getObjectKeys,
  addNewItemOrCreateArray,
};
