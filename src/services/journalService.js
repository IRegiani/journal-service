// WIP
module.exports = ({ db }) => {
  const updateJournal = async (tags = [], tagType) => {
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

  return {
    updateJournal,
  };
};
