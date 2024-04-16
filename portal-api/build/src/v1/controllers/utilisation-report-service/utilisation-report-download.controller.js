"use strict";
const tslib_1 = require("tslib");
const stream = require('stream');
const fileshare = require('../../../drivers/fileshare');
const api = require('../../api');
const { FILESHARES } = require('../../../constants/file-upload');
/**
 * Fetches metadata about the utilisation report file associated with the
 * specified MongoDB _id
 * @param _id {string} - the MongoDB _id of the report
 * @returns {Promise<{ filename: string; mimetype: string }>}
 */
const getUtilisationReportFileMetadata = (_id) => tslib_1.__awaiter(void 0, void 0, void 0, function* () {
    const { azureFileInfo } = yield api.getUtilisationReportById(_id);
    if (!(azureFileInfo === null || azureFileInfo === void 0 ? void 0 : azureFileInfo.filename)) {
        throw new Error(`Failed to get filename for utilisation report with _id '${_id}'`);
    }
    if (!(azureFileInfo === null || azureFileInfo === void 0 ? void 0 : azureFileInfo.mimetype)) {
        throw new Error(`Failed to get mimetype for utilisation report with _id '${_id}'`);
    }
    const { filename, mimetype } = azureFileInfo;
    return { filename, mimetype };
});
const getReportDownload = (req, res) => tslib_1.__awaiter(void 0, void 0, void 0, function* () {
    var _a, _b;
    const { bankId, _id } = req.params;
    try {
        const { filename, mimetype } = yield getUtilisationReportFileMetadata(_id);
        const bufferedFile = yield fileshare.readFile({
            fileshare: FILESHARES.UTILISATION_REPORTS,
            folder: bankId,
            filename,
        });
        if (bufferedFile.error) {
            const errorMessage = `Failed to get utilisation report for download with _id '${_id}' from Azure Storage`;
            console.error(errorMessage, bufferedFile.error);
            return res.status(500).send(errorMessage);
        }
        const readStream = new stream.PassThrough();
        readStream.end(bufferedFile);
        res.set('content-disposition', `attachment; filename=${filename}`);
        res.set('content-type', mimetype);
        return readStream.pipe(res);
    }
    catch (error) {
        const errorMessage = `Failed to get utilisation report for download with _id '${_id}'`;
        console.error(errorMessage, error);
        return res.status((_b = (_a = error.response) === null || _a === void 0 ? void 0 : _a.status) !== null && _b !== void 0 ? _b : 500).send({ message: errorMessage });
    }
});
module.exports = { getReportDownload };
