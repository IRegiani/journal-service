module.exports = ({ db }) => {
  const addTags = async (tags = [], tagType) => {
    const currentTags = db.get('tags').value()[tagType];
    const newTags = [];

    tags.forEach((tag) => {
      const lowerCaseTag = tag.toLowerCase();
      if (!currentTags.includes(lowerCaseTag)) newTags.push(lowerCaseTag);
    });

    if (newTags.length > 0) {
      currentTags.push(...newTags);
      await db.save();
    }

    return tags.map((tag) => tag.toLowerCase());
  };

  const updateEntryTags = (tags) => addTags(tags, 'entry');
  const updateJournalTags = (tags) => addTags(tags, 'journal');

  return {
    // Updates the tag index
    updateEntryTags,
    updateJournalTags,

    // WIP: Updates all journal/entries tags
    // renameEntryTag
    // renameJournalTag
  };
};
