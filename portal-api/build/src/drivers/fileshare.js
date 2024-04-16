"use strict";
const tslib_1 = require("tslib");
const { ShareServiceClient, StorageSharedKeyCredential } = require('@azure/storage-file-share');
const fetch = require('node-fetch');
const { FILESHARES } = require('../constants');
const { AZURE_WORKFLOW_FILESHARE_CONFIG, AZURE_PORTAL_FILESHARE_CONFIG, AZURE_UTILISATION_REPORTS_FILESHARE_CONFIG } = require('../config/fileshare.config');
let userDefinedConfig;
const setConfig = (fileshareConfig) => {
    userDefinedConfig = fileshareConfig;
};
const getConfig = (fileshare = FILESHARES.PORTAL) => {
    if (userDefinedConfig) {
        return userDefinedConfig;
    }
    switch (fileshare) {
        case FILESHARES.WORKFLOW:
            return AZURE_WORKFLOW_FILESHARE_CONFIG;
        case FILESHARES.UTILISATION_REPORTS:
            return AZURE_UTILISATION_REPORTS_FILESHARE_CONFIG;
        case FILESHARES.PORTAL:
            return AZURE_PORTAL_FILESHARE_CONFIG;
        default:
            throw new Error(`Unable to get config - unknown fileshare '${fileshare}'`);
    }
};
const getCredentials = (...args_1) => tslib_1.__awaiter(void 0, [...args_1], void 0, function* (fileshare = FILESHARES.PORTAL) {
    const { STORAGE_ACCOUNT, STORAGE_ACCESS_KEY } = getConfig(fileshare);
    const credentials = yield new StorageSharedKeyCredential(STORAGE_ACCOUNT, STORAGE_ACCESS_KEY);
    return credentials;
});
const getShareClient = (fileshare) => tslib_1.__awaiter(void 0, void 0, void 0, function* () {
    const credentials = yield getCredentials(fileshare);
    const { STORAGE_ACCOUNT, FILESHARE_NAME } = getConfig(fileshare);
    const serviceClient = new ShareServiceClient(`https://${STORAGE_ACCOUNT}.file.core.windows.net`, credentials);
    if (process.env.AZURE_LOG_LEVEL) {
        console.info('get Share props');
        const shareProps = yield serviceClient.getProperties();
        console.info({ shareProps });
    }
    const shareClient = yield serviceClient.getShareClient(FILESHARE_NAME);
    yield shareClient.create().catch(({ details }) => {
        if (!details)
            return;
        if (details.errorCode === 'ShareAlreadyExists')
            return;
        throw new Error(details.message);
    });
    return shareClient;
});
const getDirectory = (fileshare_1, ...args_2) => tslib_1.__awaiter(void 0, [fileshare_1, ...args_2], void 0, function* (fileshare, folderPaths = '') {
    const shareClient = yield getShareClient(fileshare);
    const directoryClient = shareClient.getDirectoryClient(folderPaths);
    yield directoryClient.create().catch((_a) => tslib_1.__awaiter(void 0, [_a], void 0, function* ({ details }) {
        if (!details)
            return false;
        if (details.errorCode === 'ResourceAlreadyExists')
            return false;
        if (details.errorCode === 'ParentNotFound') {
            const parentFolder = folderPaths.replace(/(\/[^/]*)\/?$/, ''); // remove last folder from string
            yield getDirectory(fileshare, parentFolder);
            return false;
        }
        return {
            errorCount: 1,
            error: {
                errorCode: details.errorCode,
                message: details.message,
            },
        };
    }));
    return directoryClient;
});
const tmpTests = () => tslib_1.__awaiter(void 0, void 0, void 0, function* () {
    const tests = ['https://www.bbc.co.uk/news'];
    tests.forEach((uri) => {
        fetch('https://www.bbc.co.uk/news', { method: 'GET' })
            .then((response) => console.info({ uri, response }))
            .catch((error) => console.error({ uri, error }));
    });
});
const uploadFile = (_b) => tslib_1.__awaiter(void 0, [_b], void 0, function* ({ fileshare, folder, filename, buffer, allowOverwrite }) {
    if (process.env.AZURE_LOG_LEVEL) {
        tmpTests();
    }
    const directoryClient = yield getDirectory(fileshare, folder);
    yield directoryClient.create().catch(({ details }) => {
        if (!details)
            return false;
        if (details.errorCode === 'ResourceAlreadyExists')
            return false;
        console.error('Fileshare create resource error %o', { fileshare, folder, details });
        return {
            errorCount: 1,
            error: {
                errorCode: details.errorCode,
                message: details.message,
            },
        };
    });
    const fileClient = yield directoryClient.getFileClient(`${filename}`);
    const existingFileProps = yield fileClient.getProperties().catch(() => { });
    if (existingFileProps && allowOverwrite) {
        yield fileClient.delete();
    }
    if (!existingFileProps || allowOverwrite) {
        yield fileClient.uploadData(buffer);
        return {
            folder,
            filename: fileClient.name,
            fullPath: fileClient.path,
            url: fileClient.url,
        };
    }
    return {
        error: {
            message: 'could not be uploaded. Each file must have unique filename',
        },
    };
});
const readFile = (_c) => tslib_1.__awaiter(void 0, [_c], void 0, function* ({ fileshare, folder = '', filename }) {
    const directory = yield getDirectory(fileshare, folder);
    const fileClient = yield directory.getFileClient(`${filename}`);
    try {
        const bufferedFile = yield fileClient.downloadToBuffer();
        return bufferedFile;
    }
    catch ({ name, statusCode }) {
        return {
            error: {
                name,
                errorCode: statusCode,
            },
        };
    }
});
const deleteFile = (fileshare, filePath) => tslib_1.__awaiter(void 0, void 0, void 0, function* () {
    const shareClient = yield getShareClient(fileshare);
    yield shareClient.deleteFile(filePath).catch(() => { });
});
const deleteMultipleFiles = (fileshare, filePath, fileList) => tslib_1.__awaiter(void 0, void 0, void 0, function* () {
    if (!fileList)
        return false;
    if (Array.isArray(fileList)) {
        return fileList.map((filename) => tslib_1.__awaiter(void 0, void 0, void 0, function* () {
            yield deleteFile(fileshare, `${filePath}/${filename}`);
        }));
    }
    return deleteFile(fileshare, `${filePath}/${fileList}`);
});
const deleteDirectory = (fileshare, folder) => tslib_1.__awaiter(void 0, void 0, void 0, function* () {
    const shareClient = yield getShareClient(fileshare);
    const deleteDir = yield shareClient.deleteDirectory(folder);
    return deleteDir;
});
const copyFile = (_d) => tslib_1.__awaiter(void 0, [_d], void 0, function* ({ from, to }) {
    const fromFile = {
        fileshare: from.fileshare,
        folder: from.folder,
        filename: from.filename,
    };
    const bufferedFile = yield readFile(fromFile);
    if (bufferedFile.error) {
        return bufferedFile;
    }
    const toFile = {
        fileshare: to.fileshare,
        folder: to.folder,
        filename: to.filename,
        buffer: bufferedFile,
    };
    const uploadedFile = yield uploadFile(toFile);
    return uploadedFile;
});
const moveFile = (_e) => tslib_1.__awaiter(void 0, [_e], void 0, function* ({ from, to }) {
    const filePath = `${from.folder}/${from.filename}`;
    const copied = yield copyFile({ from, to });
    if (copied.error) {
        return Promise.reject(new Error(`${filePath}: ${JSON.stringify(copied.error)}`));
    }
    yield deleteFile(from.fileshare, filePath);
    return copied;
});
const listDirectoryFiles = (_f) => tslib_1.__awaiter(void 0, [_f], void 0, function* ({ fileshare, folder }) {
    const directoryClient = yield getDirectory(fileshare, folder);
    const directoryList = [];
    const iter = yield directoryClient.listFilesAndDirectories();
    if (!iter) {
        return false;
    }
    let entity = yield iter.next();
    while (!entity.done) {
        directoryList.push(entity.value);
        entity = yield iter.next(); // eslint-disable-line no-await-in-loop
    }
    return directoryList;
});
module.exports = {
    setConfig,
    getConfig,
    getDirectory,
    uploadFile,
    deleteFile,
    deleteMultipleFiles,
    deleteDirectory,
    readFile,
    copyFile,
    moveFile,
    listDirectoryFiles,
};
