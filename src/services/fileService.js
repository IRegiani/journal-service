const os = require('os');
const crypto = require('crypto');
const fs = require('fs');
const fsp = require('fs').promises;
const { StatusCodes } = require('http-status-codes');
const { v4: generateUid } = require('uuid');

const logger = require('../utils/logger').initLogger({ name: 'FILE SERVICE' });
const { CustomError } = require('../utils/error')();
const { FILE_EXTENSIONS, FILE_TYPES, FILES_DIRECTORY, MAX_FILE_BYTES } = require('../utils/constants');
const { createHash, getFileName } = require('../utils/utils');
const { isIsoDateString } = require('../utils/validators');

module.exports = ({ db }) => {
  const createFileHash = (filePath) => new Promise((resolve) => {
    const hash = crypto.createHash('sha256');
    fs.createReadStream(filePath)
      .on('data', (data) => hash.update(data))
      .on('end', () => resolve(hash.digest('hex')));
  });

  const verifyFileName = (fileName) => {
    const currentFiles = db.get('files').value();

    if (fs.existsSync(`${FILES_DIRECTORY}/${fileName}`)) return new CustomError('A file with this name already exists in the directory', StatusCodes.CONFLICT);

    if (Object.keys(currentFiles).some((fileUid) => getFileName(currentFiles[fileUid].path) === fileName)) {
      return new CustomError('A file with this name already exists', StatusCodes.CONFLICT);
    }
    return null;
  };

  const validateFileMetadata = ({ filename, type }) => {
    const fileExtension = filename.substring(filename.lastIndexOf('.') + 1);

    if (!FILE_EXTENSIONS.includes(fileExtension)) return new CustomError(`Invalid file extension: ${fileExtension}`, StatusCodes.BAD_REQUEST);
    if (!FILE_TYPES.includes(type)) return new CustomError(`Invalid file type: ${type}`, StatusCodes.BAD_REQUEST);
    return null;
  };

  const checkPath = () => {
    if (!fs.existsSync(FILES_DIRECTORY)) {
      logger.warn('Directory does not exist, creating');
      fs.mkdirSync(FILES_DIRECTORY);
    }
  };

  const saveEntryToDb = async (filePath, fileHash, { ino, birthtimeNs, size }, fileType, date, originalDate) => {
    const uid = generateUid();
    const createdAt = date.toISOString();
    const hash = createHash(`${fileHash}-${createdAt}-${ino}-${birthtimeNs}`);

    const newEntry = { uid, path: filePath, size, type: fileType, createdAt, hash, originalDate };

    db.get('files').set(uid, newEntry);
    await db.save();

    logger.info('File created uid:', uid);
    return newEntry;
  };

  const cleanTempFileAndReject = (reject, files) => (error) => {
    logger.warn('Cleaning temp files');
    files.map(({ fd }) => fs.unlink(fd, (err, message) => logger.debug('Cleared temp files', { err, message })));
    reject(error);
  };

  const receiveFile = (request) => new Promise((resolve, reject) => {
    const startDate = new Date();
    const processFile = async (err, file) => {
      if (err) {
        // This lefts partial file contents in the temp folder, and this status code is actually never used
        if (err.message === 'Request aborted') return reject(new CustomError(`${err.message}\n`, StatusCodes.NO_CONTENT));
        if (err.code === 'E_EXCEEDS_UPLOAD_LIMIT') {
          return reject(new CustomError(`File is larger than the allowed limit by ${err.written - MAX_FILE_BYTES} bytes`, StatusCodes.REQUEST_TOO_LONG, err.code));
        }
        return reject(err);
      }

      if (file.length === 0) {
        logger.debug('No file, skipping file processing');
        return resolve(null);
      }

      const rejectError = cleanTempFileAndReject(reject, file);

      if (file.length > 1) return rejectError(new CustomError('Only allowed one file per request', StatusCodes.BAD_REQUEST));

      const { size, filename, type, fd: oldPath } = file[0];
      const downloadDurationSec = (new Date() - startDate) / 1000;
      const totalSizeMega = size / 1024 / 1024;
      const averageSpeed = ((totalSizeMega / downloadDurationSec) * 8).toFixed(2); // this is not exact, but good enough

      logger.info(`Received file: ${filename}, processing. Average speed: ${averageSpeed} Mbps`, { size: totalSizeMega });

      const isInvalid = validateFileMetadata(file[0]);
      if (isInvalid) return rejectError(isInvalid);

      const hash = await createFileHash(oldPath);

      const isNotUnique = verifyFileName(filename);
      if (isNotUnique) return rejectError(isNotUnique);

      const lastModified = request.headers['Last-Modified'];
      const originalDate = isIsoDateString(lastModified) ? lastModified : undefined;

      logger.debug('File validated, saving file', hash);

      const fileStat = await fsp.lstat(oldPath, { bigInt: true });

      checkPath();
      const newPath = `${FILES_DIRECTORY}/${filename}`;
      await fsp.rename(oldPath, newPath);

      const result = await saveEntryToDb(newPath, hash, fileStat, type, startDate, originalDate);
      return resolve(result);
    };

    const { isNoop: noFile } = request.file('file').upload({ dirname: os.tmpdir(), maxBytes: MAX_FILE_BYTES }, processFile);

    if (noFile) resolve(null);
  });

  const retrieveFileDetails = async (uid) => {
    const fileData = db.get('files').get(uid).value();

    if (!fileData) throw new CustomError(`No file associated with ${uid}`, StatusCodes.NOT_FOUND);

    const { path, hash: previousHash, createdAt } = fileData;
    await fsp.access(path).catch(() => { throw new CustomError(`No file on disk associated with ${uid}`, StatusCodes.NOT_FOUND); });

    const [fileHash, { ino, birthtimeNs }] = await Promise.all([createFileHash(path), fsp.lstat(path, { bigInt: true })]);

    logger.debug('Validating file', { uid, fileHash });
    const hash = createHash(`${fileHash}-${createdAt}-${ino}-${birthtimeNs}`);

    if (hash !== previousHash) throw new CustomError(`File ${uid} has been modified/replaced`, StatusCodes.INTERNAL_SERVER_ERROR);

    return fileData;
  };

  return {
    receiveFile,
    createFileHash,
    retrieveFileDetails,
  };
};
