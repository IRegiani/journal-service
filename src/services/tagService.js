const { StatusCodes } = require('http-status-codes');

const logger = require('../utils/logger').initLogger({ name: 'TAG SERVICE' });
const { CustomError } = require('../utils/error')();
const { TAG_TYPES } = require('../utils/constants');
const { updateProperties } = require('../utils/utils');
const journalService = require('./journalService');

// TODO: Move tags into user area after auth
module.exports = ({ db }) => {
  const getTagsFromDB = (tagType) => db.get('tags').value()[tagType];

  const validateTagType = (type) => {
    if (!Object.values(TAG_TYPES).includes(type)) throw new CustomError('Invalid tag type', StatusCodes.BAD_REQUEST);
  };

  const createTag = async (name, description, color, userUid, tagType) => {
    validateTagType(tagType);
    if (!name) throw new CustomError('Missing tag name', StatusCodes.BAD_REQUEST);

    const currentTags = getTagsFromDB(tagType);
    const lowerCaseName = name.toLowerCase();

    if (currentTags.some((tag) => tag.name === lowerCaseName)) throw new CustomError('Existent tag name', StatusCodes.CONFLICT);

    const newTag = { name: lowerCaseName, description, color };

    currentTags.push(newTag);
    logger.info(`Adding new ${tagType} tags`);
    await db.save();

    return newTag;
  };

  const getValidatedTags = (currentTags, tags, tagType) => {
    if (!currentTags) throw new CustomError('No tags to update', StatusCodes.BAD_REQUEST);
    if (!tags && currentTags.length === 0) return undefined;
    if (!Array.isArray(tags) || tags.some((tag) => typeof tag !== 'string')) throw new CustomError('Invalid tags format', StatusCodes.BAD_REQUEST);
    const tagsLower = tags.map(String.toLowerCase);

    const savedTags = getTagsFromDB(tagType);
    const savedTagsNames = savedTags.map((tag) => tag.name);
    const allTagsExists = tagsLower.every((newTag) => savedTagsNames.includes(newTag));
    if (!allTagsExists) throw new CustomError('Non existent tag found, try creating it first', StatusCodes.BAD_REQUEST);

    return tagsLower;
  };

  const getTags = (userUid, tagType) => {
    validateTagType(tagType);
    return getTagsFromDB(tagType);
  };

  const getTag = (userUid, tagType, tagName) => {
    const allTags = getTags(userUid, tagType);
    const tag = allTags.find((tg) => tg.name === tagName.toLowerCase());

    if (!tag) throw new CustomError(`${tagType} tag ${tagName} not found`, StatusCodes.NOT_FOUND);
    return tag;
  };

  const updateTag = async (userUid, tagType, tagName, fields) => {
    const tag = getTag(userUid, tagType, tagName);

    if (fields.name) {
      const hasTag = getTags(userUid, tagType).find((tg) => tg.name === fields.name.toLowerCase());
      if (hasTag) throw new CustomError(`${tagType} tag ${tagName} already exists`, StatusCodes.CONFLICT);
    }

    const newTag = updateProperties(tag, fields, ['name', 'color', 'description']);
    const index = getTagsFromDB(tagType).indexOf(tag);

    logger.debug(`Tag on index ${index} is being updated`, { name: tagName });

    await db.get('tags').get(tagType).get(index).set(newTag)
      .save();

    return newTag;
  };

  const deleteTag = async (userUid, tagType, tagName) => {
    const tagToDelete = getTag(userUid, tagType, tagName);

    logger.debug(`Tag ${tagName} is being removed`, { name: tagName });
    db.get('tags').get(tagType).filter((tag) => tag.name !== tagToDelete.name);
    await db.save();

    if (tagType === TAG_TYPES.journal) {
      const journals = journalService.getJournalsByTag(tagToDelete.name);
      const journalUids = journals.map((journal) => journal.uid);
      logger.info(`Got ${journals.length} journals with tag ${tagToDelete.name}, updating them`, { journalUids });

      await Promise.all(journals.map(
        (journal) => journalService.updateJournal(journal.uid, journal.tag.filter((tag) => tag !== tagToDelete.name)),
      ));
      return { journalUids };
    }
    const journalUids = await journalService.updateBatchEntriesByTag(tagToDelete.name);
    return { journalUids };
  };

  const getValidatedEntryTags = (currentTags, tags) => getValidatedTags(currentTags, tags, TAG_TYPES.entry);
  const getValidatedJournalTags = (currentTags, tags) => getValidatedTags(currentTags, tags, TAG_TYPES.journal);

  return {
    // Updates the tag index
    createTag,
    getTag,
    getTags,
    updateTag,
    deleteTag,

    getValidatedEntryTags,
    getValidatedJournalTags,
  };
};
