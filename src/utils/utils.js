const crypto = require('crypto');

const createHash = (string) => crypto.createHash('sha256').update(string).digest('hex');

const getFileName = (path) => path.substring(path.lastIndexOf('/') + 1);

module.exports = {
  createHash,
  getFileName,
};
