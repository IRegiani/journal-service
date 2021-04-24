const { StatusCodes } = require('http-status-codes');

const logger = require('../utils/logger').initLogger({ name: 'TAG SERVICE' });
const { CustomError } = require('../utils/error')();

module.exports = ({ db }) => {
  const getTagsFromDB = (tagType) => db.get('tags').value()[tagType];

  // TODO: not being used
  const addTags = async (tags, tagType) => {
    if (!tags) return undefined;

    const currentTags = getTagsFromDB(tagType);
    const newTags = [];

    tags.forEach((tag) => {
      const lowerCaseTag = tag.toLowerCase();
      const shouldAdd = currentTags.some(({ name }) => name !== lowerCaseTag) || currentTags.length === 0;
      // TODO: Add description and color
      if (shouldAdd) newTags.push({ name: lowerCaseTag });
    });

    if (newTags.length > 0) {
      currentTags.push(...newTags);
      logger.info(`Adding  new ${tagType} tags`);
      await db.save();
    }

    return tags;
  };

  const getValidatedTags = (currentTags, tags, tagType) => {
    if (!currentTags) throw new CustomError('No tags to update', StatusCodes.NO_CONTENT);
    if (!tags && currentTags.length === 0) return undefined;
    if (!Array.isArray(tags) || tags.some((tag) => typeof tag !== 'string')) throw new CustomError('Invalid tags format', StatusCodes.BAD_REQUEST);
    const tagsLower = tags.map(String.toLowerCase);

    const savedTags = getTagsFromDB(tagType);
    const savedTagsNames = savedTags.map((tag) => tag.name);
    const allTagsExists = tagsLower.every((newTag) => savedTagsNames.includes(newTag));
    if (!allTagsExists) throw new CustomError('Non existent tag found, try creating it first', StatusCodes.BAD_REQUEST);

    return tagsLower;
  };

  const addEntryTags = async (tags) => addTags(tags, 'entry');
  const addJournalTags = async (tags) => addTags(tags, 'journal');
  const getValidatedEntryTags = (currentTags, tags) => getValidatedTags(currentTags, tags, 'entry');
  const getValidatedJournalTags = (currentTags, tags) => getValidatedTags(currentTags, tags, 'journal');

  return {
    // Updates the tag index
    addEntryTags,
    addJournalTags,

    getValidatedEntryTags,
    getValidatedJournalTags,

    // WIP: Deletes all journal/entries tags
    // deletesEntryTag
    // deletesJournalTag
  };
};
