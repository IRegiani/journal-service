const crypto = require('crypto');

module.exports = (options) => {
  const tagService = require('./tagService')(options);

  const createFirstEntry = async (currentDate, description, entryTags = [], attachmments = []) => {
    const tags = await tagService.addTagToEntry(entryTags);
    const attachmentUid = attachmments.find((attachmment) => attachmment.addToEntry === true)?.uid;

    if (!description && !attachmentUid) return [];

    return [{
      description,
      date: currentDate,
      file: attachmentUid,
      tags,
      hash: crypto.createHash('sha256').update(`${description}${attachmentUid}${currentDate}`).digest('hex'), // TODO: this should also receive a salt
    }];
  };

  return {
    createFirstEntry,
  };
};
