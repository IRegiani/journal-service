module.exports = ({ db }) => {
  const addTags = async (tags = [], tagType) => {
    const currentTags = db.get('tags')[tagType]; // WIP: needs .value?
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

  const addTagToEntry = (tags) => addTags(tags, 'entry');
  const addTagToJournal = (tags) => addTags(tags, 'journal');

  return {
    addTagToEntry,
    addTagToJournal,
  };
};
