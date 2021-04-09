module.exports = {
  FILE_EXTENSIONS: ['mp4', 'mkv', 'pdf', 'txt', 'mp3', 'docx', 'png', 'jpg'],
  FILES_DIRECTORY: './files',
  FILE_TYPES: ['text/plain', 'application/pdf', 'video/x-matroska', 'video/mp4', 'image/png', 'image/jpg'],
  MAX_FILE_BYTES: 2684354560, // 2.5 GiB

  UPDATE_TYPES: {
    newEntry: 'NEW_ENTRY',
    deletedEntry: 'DELETED_ENTRY',
    addedFile: 'ADDED_FILE',
  },
};
