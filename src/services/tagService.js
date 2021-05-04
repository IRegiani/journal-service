const { StatusCodes } = require('http-status-codes');

const logger = require('../utils/logger').initLogger({ name: 'TAG SERVICE' });
const { CustomError } = require('../utils/error')();
const { TAG_TYPES } = require('../utils/constants');
const { updateProperties } = require('../utils/utils');

// TODO: Move tags into user area after auth
module.exports = (options = {}) => {
  const { db } = options;
  const getTagsFromDB = (tagType) => db.get('tags').value()[tagType];

  const validateTagType = (type) => {
    if (!Object.values(TAG_TYPES).includes(type)) throw new CustomError('Invalid tag type', StatusCodes.BAD_REQUEST);
  };

  const createTag = async (name, description, color, userUid, tagType) => {
    validateTagType(tagType);
    if (!name) throw new CustomError('Missing tag name', StatusCodes.BAD_REQUEST);

    const currentTags = getTagsFromDB(tagType);
    const lowerCaseName = name.toLowerCase().trim();

    if (currentTags.some((tag) => tag.name === lowerCaseName)) throw new CustomError('Existent tag name', StatusCodes.CONFLICT);

    const newTag = { name: lowerCaseName, description, color };

    currentTags.push(newTag);
    logger.debug(`Adding new ${tagType} tag`, name);
    await db.save();

    return newTag;
  };

  const getValidatedTags = (currentTags, tags, tagType) => {
    if (!currentTags) throw new CustomError('No tags to update', StatusCodes.BAD_REQUEST);

    // when removing tags by setting them as null, empty array or creating an empty tag fo journal/entry
    if (tags === null || (!tags && currentTags.length === 0) || tags.length === 0) {
      logger.debug('Returning empty tags');
      return undefined;
    }
    const tagsFromString = typeof tags === 'string' ? tags.split(',').map((s) => s.trim()) : undefined; // on requests with content-type multipart/form-data
    const tagsToCheck = tagsFromString || tags;
    if (!Array.isArray(tagsToCheck) || tagsToCheck.some((tag) => typeof tag !== 'string')) throw new CustomError('Invalid tags format', StatusCodes.BAD_REQUEST);
    const tagsLower = (tagsToCheck).map((tag) => tag.toLowerCase());

    const savedTags = getTagsFromDB(tagType);
    const savedTagsNames = savedTags.map((tag) => tag.name);
    const allTagsExists = tagsLower.every((newTag) => savedTagsNames.includes(newTag));
    if (!allTagsExists) throw new CustomError(`Non existent ${tagType} tag found, try creating it first`, StatusCodes.BAD_REQUEST);

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

    if (fields.name === null) throw new CustomError('Tag name cannot be null', StatusCodes.BAD_REQUEST);

    const newTag = updateProperties(tag, fields, ['name', 'color', 'description']);
    const index = getTagsFromDB(tagType).indexOf(tag);

    logger.debug(`Tag on index ${index} is being updated`, { name: tagName });

    // WIP: every entry/journal with this tag should be updated as well

    await db.get('tags').get(tagType).get(index).set(newTag)
      .save();

    return newTag;
  };

  const deleteTag = async (userUid, tagType, tagName) => {
    const tagToDelete = getTag(userUid, tagType, tagName);
    const journalService = require('./journalService')({ db });

    logger.debug(`Tag ${tagName} is being removed`, { name: tagName });
    db.get('tags').get(tagType).filter((tag) => tag.name !== tagToDelete.name);

    if (tagType === TAG_TYPES.journal) {
      const journals = journalService.getJournalsByTag(tagToDelete.name);
      const journalUids = journals.map((journal) => journal.uid);
      logger.info(`Got ${journals.length} journals with tag ${tagToDelete.name}, updating them`, { journalUids });

      await Promise.all(journals.map(
        (journal) => journalService.updateJournal(journal.uid, journal.tags.filter((tag) => tag !== tagToDelete.name)),
      ));
      return { journalUids };
    }
    const journalUids = await journalService.removeTagFromEntriesBatch(tagToDelete.name);
    // await db.save();
    return { journalUids };
  };

  const getValidatedEntryTags = (currentTags, tags) => getValidatedTags(currentTags, tags, TAG_TYPES.entry);
  const getValidatedJournalTags = (currentTags, tags) => getValidatedTags(currentTags, tags, TAG_TYPES.journal);

  return {
    // Updates the tag index, and references
    createTag,
    getTag,
    getTags,
    updateTag,
    deleteTag,

    getValidatedEntryTags,
    getValidatedJournalTags,
  };
};
