module.exports = {
  FILE_EXTENSIONS: ['mp4', 'mkv', 'pdf', 'txt', 'mp3', 'docx', 'png', 'jpg', 'docx'],
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

  UPDATE_TYPES: {
    addedEntry: 'ADDED_ENTRY',
    addedFile: 'ADDED_FILE',
    modifiedTag: 'MODIFIED_TAG',
  },
};
