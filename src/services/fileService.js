// Most fs are done directly from database paths, and the only one that happens is based on filename is sanitized
/* eslint-disable security/detect-non-literal-fs-filename */
const os = require('os');
const crypto = require('crypto');
const fs = require('fs');
const fsp = require('fs').promises;
const { StatusCodes } = require('http-status-codes');
const { v4: generateUid } = require('uuid');
const MediaInfo = require('mediainfo.js');

const logger = require('../utils/logger').initLogger({ name: 'FILE SERVICE' });
const { CustomError } = require('../utils/error')();
const { FILE_EXTENSIONS, FILE_TYPES, FILES_DIRECTORY, MAX_FILE_BYTES, CUSTOM_RESPONSES, CUSTOM_HEADERS, FILE_CHUNK } = require('../utils/constants');
const { createHash, getFileName } = require('../utils/utils');
const { isIsoDateString } = require('../utils/validators');

module.exports = (options = {}) => {
    const { db } = options;
    const createFileHash = (filePath) => new Promise((resolve) => {
        const hash = crypto.createHash('sha256');
        fs.createReadStream(filePath)
            .on('data', (data) => hash.update(data))
            .on('end', () => resolve(hash.digest('hex')));
    });

    const verifyFileName = (fileName) => {
        const currentFiles = db.get('files').value();

        if (fs.existsSync(`${FILES_DIRECTORY}/${fileName}`)) return new CustomError('A file with this name already exists in the directory', StatusCodes.CONFLICT);

        // eslint-disable-next-line security/detect-object-injection
        if (Object.keys(currentFiles).some((fileUid) => getFileName(currentFiles[fileUid].path) === fileName)) {
            return new CustomError('A file with this name already exists', StatusCodes.CONFLICT);
        }
        return null;
    };

    const validateFileMetadata = ({ filename, type }) => {
        const fileExtension = filename.substring(filename.lastIndexOf('.') + 1);

        if (!FILE_EXTENSIONS.includes(fileExtension)) return new CustomError(`Invalid file extension: ${fileExtension}`, StatusCodes.UNSUPPORTED_MEDIA_TYPE);
        if (!FILE_TYPES.includes(type)) return new CustomError(`Invalid file type: ${type}`, StatusCodes.UNSUPPORTED_MEDIA_TYPE);
        return null;
    };

    const checkPath = () => {
        if (!fs.existsSync(FILES_DIRECTORY)) {
            logger.warn('Directory does not exist, creating');
            fs.mkdirSync(FILES_DIRECTORY);
        }
    };

    // this is not exact, but good enough
    const getTransferSpeedAndMegabytes = (startDate, size) => {
        const downloadDurationSec = (new Date() - startDate) / 1000;
        const sizeMegabytes = size / 1024 / 1024;
        const averageSpeed = ((sizeMegabytes / downloadDurationSec) * 8).toFixed(2);

        return { averageSpeed, sizeMegabytes };
    };

    const saveEntryToDb = async (filePath, fileHash, { ino, birthtimeNs, size }, fileType, date, originalDate, author) => {
        const uid = generateUid();
        const createdAt = date.toISOString();
        const hash = createHash(`${fileHash}-${createdAt}-${ino}-${birthtimeNs}`);

        const newEntry = { uid, path: filePath, size, type: fileType, createdAt, hash, originalDate, author };

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

    // This needs a refactor sometime
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
            // WIP: filename should be sanitized or path.normalize(path) when reading
            // https://owasp.org/www-community/attacks/Path_Traversal
            const { averageSpeed, sizeMegabytes } = getTransferSpeedAndMegabytes(startDate, size);

            logger.info(`Received file: ${filename}, processing. Average speed: ${averageSpeed} Mbps`, { size: sizeMegabytes });

            const isInvalid = validateFileMetadata(file[0]);
            if (isInvalid) return rejectError(isInvalid);

            const hash = await createFileHash(oldPath);

            const isNotUnique = verifyFileName(filename);
            if (isNotUnique) return rejectError(isNotUnique);

            const creationDate = request.headers[CUSTOM_HEADERS.creationDate];
            const originalDate = isIsoDateString(creationDate) ? creationDate : undefined;

            logger.debug('File validated, saving file', hash);

            const fileStat = await fsp.lstat(oldPath, { bigInt: true });

            const newPath = `${FILES_DIRECTORY}/${filename}`;
            await fsp.rename(oldPath, newPath);

            const result = await saveEntryToDb(newPath, hash, fileStat, type, startDate, originalDate, request.user.uid);
            return resolve(result);
        };

        const { isNoop: noFile } = request.file('file').upload({ dirname: os.tmpdir(), maxBytes: MAX_FILE_BYTES }, processFile);

        if (noFile) resolve(null);
    });

    // TODO: Check if replacing a file by other equal fails
    const retrieveFileDetails = async (uid, userUid) => {
        const fileData = db.get('files').get(uid).value();

        if (!fileData) throw new CustomError(`No file associated with ${uid}`, StatusCodes.NOT_FOUND);
        if (userUid && fileData.author !== userUid) throw new CustomError(`Access to file ${uid} was denied`, StatusCodes.FORBIDDEN);

        const { path, hash: previousHash, createdAt } = fileData;
        await fsp.access(path).catch(() => { throw new CustomError(`No file on disk associated with ${uid}. It might have been moved`, StatusCodes.NOT_FOUND); });

        const [fileHash, { ino, birthtimeNs }] = await Promise.all([createFileHash(path), fsp.lstat(path, { bigInt: true })]);

        logger.debug('Validating file', { uid, fileHash });
        const hash = createHash(`${fileHash}-${createdAt}-${ino}-${birthtimeNs}`);

        // eslint-disable-next-line security/detect-possible-timing-attacks
        if (hash === previousHash) throw new CustomError(`File ${uid} has been modified/replaced`, CUSTOM_RESPONSES.CODES.hashValidation);

        return fileData;
    };

    const getMediaInfo = async (uid) => {
        let mediaInfoData;
        const { path, size, type } = db.get('files').get(uid).value() || {};

        if (!path || (!type.includes('video') && !type.includes('audio'))) return undefined;
        logger.info('Getting media info', uid);

        const [mediaInfo, fileHandle] = await Promise.all([MediaInfo(), fsp.open(path)]);

        try {
            const reader = async (fileSize, offset) => {
                const buffer = new Uint8Array(size);
                await fileHandle.read(buffer, 0, fileSize, offset);
                return buffer;
            };
            ({ media: { track: mediaInfoData } } = await mediaInfo.analyzeData(() => size, reader));
        } catch (error) {
            logger.warn('Error getting media info from file', error);
        } finally {
            fileHandle.close();
        }

        return mediaInfoData;
    };

    const retrieveFile = async (response, uid, userUid, range, isHeadRequest, includeMediaInfo) => {
        const promises = [retrieveFileDetails(uid, userUid)];
        if (includeMediaInfo) promises.push(getMediaInfo(uid));
        const [fileDetails, mediaInfo] = await Promise.all(promises);

        const { path, size, originalDate, type } = fileDetails;

        const responseHeaders = { 'accept-ranges': 'bytes', 'content-length': size, 'content-type': type };

        if (includeMediaInfo && mediaInfo) responseHeaders[CUSTOM_HEADERS.mediaInfo] = [mediaInfo[1].Format, mediaInfo[0].Duration, mediaInfo[0].Encoded_Date].join(',');
        if (originalDate) responseHeaders[CUSTOM_HEADERS.creationDate] = originalDate;

        if (isHeadRequest) {
            logger.info('Head request, returning metadata only');
            responseHeaders['content-disposition'] = `attachment; filename="${getFileName(path)}"`;
            return response.status(StatusCodes.NO_CONTENT).set(responseHeaders).end();
        }

        if (!range) {
            logger.info('No range header, sending all file');
            const startDate = new Date();
            const callback = (err) => {
                if (err) {
                    const message = 'Error on file download';
                    logger.error(message, err);
                    const errorCode = err.status || StatusCodes.INTERNAL_SERVER_ERROR;
                    return response.status(errorCode).json({ message });
                }
                const { averageSpeed } = getTransferSpeedAndMegabytes(startDate, size);
                logger.debug(`File sent. Average speed: ${averageSpeed} Mbps`);
                return undefined;
            };
            return response.download(path, undefined, { headers: responseHeaders }, callback);
        }

        const rangeStart = Number(range.replace(/\D/g, ''));
        const rangeEnd = Math.min(rangeStart + FILE_CHUNK, size - 1);
        logger.info('Sending partial file content', { rangeStart, rangeEnd });

        if (rangeStart >= size) throw new CustomError(`Invalid range: ${rangeStart}`, StatusCodes.REQUESTED_RANGE_NOT_SATISFIABLE);

        responseHeaders['content-range'] = `bytes ${rangeStart}-${rangeEnd}/${size}`;
        responseHeaders['content-length'] = rangeEnd - rangeStart + 1;
        responseHeaders['content-type'] = type;

        // eslint-disable-next-line security/detect-non-literal-fs-filename
        const stream = fs.createReadStream(path, { rangeStart, rangeEnd });
        response.status(StatusCodes.PARTIAL_CONTENT);
        response.set(responseHeaders);
        return stream.pipe(response);
    };

    return {
        checkPath,
        receiveFile,
        createFileHash,
        retrieveFile,
        retrieveFileDetails,
        getMediaInfo,
        getTransferSpeedAndMegabytes,
    };
};
