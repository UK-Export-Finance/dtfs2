"use strict";
const tslib_1 = require("tslib");
const stream = require('stream');
const { ObjectId } = require('mongodb');
const filesize = require('filesize');
const db = require('../../../drivers/db-client');
const utils = require('../utils.service');
const File = require('../models/files');
const { userHasAccess } = require('../utils.service');
const fileshare = require('../../../drivers/fileshare');
const { formatFilenameForSharepoint } = require('../../../utils');
const { FILE_UPLOAD, FILESHARES } = require('../../../constants');
const { MAKER } = require('../../roles/roles');
const FILESHARE = FILESHARES.PORTAL;
const { EXPORT_FOLDER } = fileshare.getConfig(FILESHARE);
const DEFAULT_UNITS = ['KiB', 'B', 'kbit'];
const filesCollection = 'files';
const dealCollectionName = 'deals';
const fileError = (file) => {
    let error;
    const fileExtension = file.originalname.match(/\.[^.]*$/g);
    if (!FILE_UPLOAD.ALLOWED_FORMATS.includes(fileExtension[0])) {
        error = `The selected file must be ${FILE_UPLOAD.ALLOWED_FORMATS.join(', ')}`;
    }
    const { value: currentFileSize, unit } = filesize(file.size, { base: 2, output: 'object' });
    if (DEFAULT_UNITS.includes(unit) || (unit === 'MiB' && currentFileSize <= FILE_UPLOAD.MAX_FILE_SIZE_IN_MB)) {
        return null; // don't throw an error if the file is smaller than the max size allowed
    }
    error = `${file.originalname} must be smaller than ${FILE_UPLOAD.MAX_FILE_SIZE_IN_MB}MB`;
    return error;
};
const errorFormat = (file, parentId, error) => ({
    parentId,
    filename: file.originalname,
    mimetype: file.mimetype,
    encoding: file.encoding,
    size: file.size,
    error,
});
exports.create = (req, res) => tslib_1.__awaiter(void 0, void 0, void 0, function* () {
    const { files, body: { parentId, documentPath }, } = req;
    if (req.filesNotAllowed) {
        return res.status(400).json(req.filesNotAllowed);
    }
    // ensure a parentId exists
    if (!parentId || !ObjectId.isValid(parentId))
        return res.status(400).send('Missing or invalid parentId');
    // Ensure some files have been passed
    if (!(files === null || files === void 0 ? void 0 : files.length))
        return res.status(400).send('missing files');
    // Check deal exists
    const dealCollection = yield db.getCollection(dealCollectionName);
    const deal = yield dealCollection.findOne({ _id: { $eq: ObjectId(String(parentId)) } });
    if (!deal)
        return res.status(422).send('Parent deal not found');
    // Check user has rights to access this file
    if (!userHasAccess(req.user, deal, [MAKER]))
        return res.sendStatus(401);
    try {
        const processedFiles = yield Promise.all(files.map((item) => tslib_1.__awaiter(void 0, void 0, void 0, function* () {
            const file = item;
            const error = fileError(file);
            if (error)
                return errorFormat(file, parentId, error);
            file.originalname = formatFilenameForSharepoint(file.originalname);
            const fileResult = yield fileshare.uploadFile({
                buffer: file.buffer,
                fileshare: FILESHARE,
                folder: `${EXPORT_FOLDER}/${parentId}/${documentPath}`,
                filename: formatFilenameForSharepoint(file.originalname),
            });
            if (fileResult.error)
                return errorFormat(fileResult, parentId, `${file.originalname} ${fileResult.error.message}`);
            const fileObject = Object.assign(Object.assign({}, file), { documentPath });
            const collection = yield db.getCollection(filesCollection);
            const insertedFile = yield collection.insertOne(new File(fileObject, parentId));
            const insertedId = String(insertedFile.insertedId);
            if (!ObjectId.isValid(insertedId)) {
                return res.status(400).send({ status: 400, message: 'Invalid Inserted Id' });
            }
            const fileData = yield collection.findOne({
                _id: { $eq: ObjectId(insertedId) },
            });
            return fileData;
        })));
        const status = processedFiles.every((file) => !!file.error) ? 200 : 201;
        return res.status(status).send(processedFiles);
    }
    catch (error) {
        console.error('Error uploading file(s) %o', error);
        return res.status(500).send('An error occurred while uploading the file');
    }
});
const getFile = (id) => tslib_1.__awaiter(void 0, void 0, void 0, function* () {
    if (!ObjectId.isValid(String(id))) {
        throw new Error('Invalid File Id');
    }
    const collection = yield db.getCollection(filesCollection);
    const file = yield collection.findOne({ _id: { $eq: ObjectId(String(id)) } });
    let deal;
    if (file) {
        if (!ObjectId.isValid(String(file.parentId))) {
            throw new Error('Invalid File Parent Id');
        }
        const dealCollection = yield db.getCollection(dealCollectionName);
        deal = yield dealCollection.findOne({ _id: { $eq: ObjectId(String(file.parentId)) } });
    }
    return [file, deal];
});
exports.getById = (req, res) => tslib_1.__awaiter(void 0, void 0, void 0, function* () {
    const [file, deal] = yield getFile(req.params.id);
    // Check file exists
    if (!file)
        return res.status(404).send();
    // Check user has rights to access this file
    if (!userHasAccess(req.user, deal))
        return res.sendStatus(401);
    return res.status(200).send(file);
});
exports.downloadFile = (req, res) => tslib_1.__awaiter(void 0, void 0, void 0, function* () {
    const [file, deal] = yield getFile(req.params.id);
    // Check file exists
    if (!file)
        return res.status(404).send();
    // Check user has rights to access this file
    if (!userHasAccess(req.user, deal))
        return res.sendStatus(401);
    try {
        const { filename, mimetype, documentPath } = file;
        const documentLocation = {
            fileshare: FILESHARE,
            folder: `${EXPORT_FOLDER}/${deal._id}/${documentPath}`,
            filename,
        };
        const bufferedFile = yield fileshare.readFile(documentLocation);
        const readStream = new stream.PassThrough();
        readStream.end(bufferedFile);
        res.set('Content-disposition', `attachment; filename=${filename}`);
        res.set('Content-Type', mimetype);
        return readStream.pipe(res);
    }
    catch (error) {
        console.error('Error downloading file %o', error);
        return res.status((error === null || error === void 0 ? void 0 : error.code) || 500).send('An error occurred while downloading the file');
    }
});
exports.delete = (req, res) => tslib_1.__awaiter(void 0, void 0, void 0, function* () {
    try {
        const [file, deal] = yield getFile(req.params.id);
        // Check file exists
        if (!file)
            return res.status(404).send();
        if (!ObjectId.isValid(file._id)) {
            return res.status(400).send({ status: 400, message: 'Invalid File Id' });
        }
        // Check user has rights to access this file
        if (!userHasAccess(req.user, deal))
            return res.sendStatus(401);
        const { documentPath } = req.body;
        yield fileshare.deleteFile(FILESHARE, `${EXPORT_FOLDER}/${deal._id}/${documentPath}/${file.filename}`);
        const collection = yield db.getCollection(filesCollection);
        const response = yield collection.findOneAndDelete({ _id: { $eq: ObjectId(file._id) } });
        return res.status(utils.mongoStatus(response)).send(response.value);
    }
    catch (error) {
        console.error('Error deleting file %o', error);
        return res.status((error === null || error === void 0 ? void 0 : error.code) || 500).send('An error occurred while deleting the file');
    }
});
