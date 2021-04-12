const logger = require('../utils/logger').initLogger({ name: 'TAG SERVICE' });

module.exports = ({ db }) => {
  const addTags = async (tags = [], tagType) => {
    const currentTags = db.get('tags').value()[tagType];
    const newTags = [];

    tags.forEach((tag) => {
      const lowerCaseTag = tag.toLowerCase();
      const shouldAdd = currentTags.some(({ name }) => name !== lowerCaseTag) || currentTags.length === 0;
      if (shouldAdd) newTags.push({ name: lowerCaseTag, color: null });
    });

    if (newTags.length > 0) {
      currentTags.push(...newTags);
      logger.info(`Adding  new ${tagType} tags`);
      await db.save();
    }

    return tags;
  };

  const addEntryTags = async (tags) => addTags(tags, 'entry');
  const addJournalTags = async (tags) => addTags(tags, 'journal');

  return {
    // Updates the tag index
    addEntryTags,
    addJournalTags,

    // WIP: Updates all journal/entries tags, rename, change color, add property
    // updateEntryTag
    // updateJournalTag

    // WIP: Deletes all journal/entries tags
    // deletesEntryTag
    // deletesJournalTag
  };
};
