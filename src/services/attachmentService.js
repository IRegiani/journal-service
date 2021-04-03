// WIP:
// https://www.webdevdrops.com/upload-arquivos-node-js-multer/
// const { v4: generateUid } = require('uuid');

const crypto = require('crypto');
const fs = require('fs');

module.exports = ({ db }) => {
  // eslint-disable-next-line arrow-body-style
  const addAttachment = async (tags, tagType) => {
    // const currentAttachments = db.get('attachments'); // WIP: needs .value?
    // const newTags = [];
    return tags.map((tag) => tag.toLowerCase);
  };

  const validateAttachment = () => { };
  const validateAttachments = async () => { };
  const verifyUniqueness = () => { };

  const createHash = (filePath) => new Promise((resolve) => {
    const hash = crypto.createHash('sha1');
    fs.createReadStream(filePath)
      .on('data', (data) => hash.update(data))
      .on('end', () => resolve(hash.digest('hex')));
  });

  return {
    validateAttachment,
    validateAttachments,
    addAttachment,
    verifyUniqueness,
    createHash,
  };
};
