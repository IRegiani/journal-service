const { getObjectWithoutValuesByKeys } = require('../../utils/utils');
const entry = require('./entry')();
const { tags } = require('./tags')();

const fullJournal = {
  schema: {
    type: 'object',
    properties: {
      uid: {
        type: 'string',
        format: 'uuid',
        example: '37d7095d-dfe3-4aea-8f71-9afc1d244050',
      },
      timestamp: {
        type: 'string',
        format: 'date-time',
        example: '2021-05-08T23:56:15.585Z',
        default: new Date().toISOString(),
      },
      createdAt: {
        type: 'string',
        format: 'date-time',
        example: '2021-05-08T23:56:15.585Z',
      },
      author: {
        type: 'string',
        format: 'uuid',
        example: '76aad0f8-5ac8-4028-b148-827551af23f7',
      },
      tags,
      entries: {
        type: 'array',
        items: entry,
      },
    },
  },
};

const basicJournal = {
  schema: {
    type: 'object',
    properties: {
      ...fullJournal.schema.properties,
      entries: {
        type: 'array',
        items: {
          type: 'object',
          properties: getObjectWithoutValuesByKeys(entry.properties, ['fileUids', 'fileEntry']),
        },
      },
    },
  },
};

const smallJournalList = {
  schema: {
    type: 'array',
    items: {
      type: 'object',
      properties: {
        ...fullJournal.schema.properties,
        // entries: {
        //   type: 'array',
        //   items: {
        //     type: 'object',
        //     properties: getObjectWithoutValuesByKeys(entry.properties, ['fileUids', 'fileEntry']),
        //   },
        // },
      },
    },
  },
};

module.exports = () => ({ fullJournal, basicJournal, smallJournalList });
