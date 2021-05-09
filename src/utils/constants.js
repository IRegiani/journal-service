module.exports = {
  FILE_EXTENSIONS: ['mp4', 'mkv', 'pdf', 'txt', 'mp3', 'docx', 'png', 'jpg', 'docx'],
  // TODO: Check access to other directories, including non existent ones
  FILES_DIRECTORY: './files',
  FILE_TYPES: [
    'text/plain',
    'application/pdf',
    'video/x-matroska',
    'video/mp4',
    'image/png',
    'image/jpg',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  ],

  MAX_FILE_BYTES: 2684354560, // 2.5 GiB

  MAX_JOURNAL_UPDATE_TIMEOUT: 5,

  TAG_TYPES: {
    journal: 'journal',
    entry: 'entry',
  },

  UPDATE_TYPES: {
    addedEntry: 'ADDED_ENTRY',
    addedFile: 'ADDED_FILE',
    modifiedTag: 'MODIFIED_TAG',
  },

  CUSTOM_RESPONSES: {
    CODES: {
      hashValidation: 530,
    },
    DESCRIPTION: {
      530: 'Hash validation failed. The requested resource was modified by a third party',
    },
  },
};
