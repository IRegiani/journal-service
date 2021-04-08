const os = require('os');
const crypto = require('crypto');
const fs = require('fs');
const fsp = require("fs/promises");
const { StatusCodes } = require('http-status-codes');
const { v4: generateUid } = require('uuid');

const logger = require('../utils/logger').initLogger({ name: 'FILE SERVICE' });
const { CustomError } = require('../utils/error')();
const { FILE_EXTENSIONS, FILE_TYPES, FILES_DIRECTORY, MAX_FILE_BYTES } = require('../utils/constants');
const { createHash, getFileName } = require('../utils/utils');

module.exports = ({ db }) => {
  const createFileHash = (filePath) => new Promise((resolve) => {
    const hash = crypto.createHash('sha256');
    fs.createReadStream(filePath)
      .on('data', (data) => hash.update(data))
      .on('end', () => resolve(hash.digest('hex')));
  });

  const verifyFileName = (fileName) => {
    const currentAttachments = db.get('attachments').value();

    if (fs.existsSync(`${FILES_DIRECTORY}/${fileName}`)) return new CustomError('A file with this name alredy exists in the directory', StatusCodes.CONFLICT);

    if (Object.keys(currentAttachments).some(attachmentUid => getFileName(currentAttachments[attachmentUid].path) === fileName))
      return new CustomError('A file with this name alredy exists', StatusCodes.CONFLICT);
  };

  const validateFileMetada = ({ filename, type }) => {
    const fileExtension = filename.substring(filename.lastIndexOf('.') + 1);

    if (!FILE_EXTENSIONS.includes(fileExtension)) return new CustomError(`Invalid file extension: ${fileExtension}`, StatusCodes.BAD_REQUEST);
    if (!FILE_TYPES.includes(type)) return new CustomError(`Invalid file type: ${type}`, StatusCodes.BAD_REQUEST);
  };

  const checkPath = () => {
    if (!fs.existsSync(FILES_DIRECTORY)) {
      logger.debug('Directory does not exist, creating');
      fs.mkdirSync(FILES_DIRECTORY);
    }
  }

  const saveEntryToDb = async (filePath, fileHash, { ino, birthtimeMs, size }, fileType, date) => {
    const uid = generateUid();
    const createdAt = date.toISOString();

    const newEntry = {
      uid,
      path: filePath,
      size,
      type: fileType,
      createdAt,
      hash: createHash(`${fileHash}-${createdAt}-${ino}-${birthtimeMs}`),
    };

    db.get('attachments').set(uid, newEntry);
    await db.save();
    logger.info('Attachment created', uid);
    return { uid, path: filePath };
  };

  const receiveFile = (request) => new Promise((resolve, reject) => {
    const startDate = new Date();

    const processFile = async (err, file) => {
      if (err) return reject(err);

      if (file.length === 0) {
        logger.debug('No file - Skip processing');
        return resolve(null);
      }

      if (file.length > 1) return reject(new CustomError('Only allowed one file per request', StatusCodes.BAD_REQUEST));

      const { size, filename, type, fd: oldPath } = file[0];
      const downloadDurationSec = (new Date() - startDate) / 1000;
      const totalSizeMega = size / 1024 / 1024;
      const averageSpeed = ((totalSizeMega / downloadDurationSec) * 8).toFixed(2); // this is not exact, but good enough

      logger.info(`Received file: ${filename}, processing. Average speed: ${averageSpeed} Mbps`, { size: totalSizeMega });

      const isInvalid = validateFileMetada(file[0]);
      if (isInvalid) return reject(isInvalid);

      const hash = await createFileHash(oldPath);

      const isNotUnique = verifyFileName(filename);
      if (isNotUnique) return reject(isNotUnique);

      logger.info('File validated, saving file', hash);

      const fileStat = await fsp.lstat(oldPath);

      checkPath();
      const newPath = `${FILES_DIRECTORY}/${filename}`
      await fsp.rename(oldPath, newPath);

      console.log('newPath', newPath);

      const result = await saveEntryToDb(newPath, hash, fileStat, type, startDate)
      resolve(result);
    }

    const { isNoop: noFile } = request.file('file').upload({ dirname: os.tmpdir(), maxBytes: MAX_FILE_BYTES }, processFile)

    if (noFile) resolve(null);
  });

  return {
    receiveFile,
    createFileHash,
  };
};
