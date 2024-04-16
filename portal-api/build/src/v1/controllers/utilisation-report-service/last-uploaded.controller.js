"use strict";
const tslib_1 = require("tslib");
const api = require('../../api');
const getLastUploadedReportByBankId = (req, res) => tslib_1.__awaiter(void 0, void 0, void 0, function* () {
    var _a, _b;
    try {
        const { bankId } = req.params;
        const uploadedReports = yield api.getUtilisationReports(bankId, {
            excludeNotUploaded: true,
        });
        const lastUploadedReport = uploadedReports.at(-1);
        if (!lastUploadedReport) {
            throw new Error(`Failed to find any uploaded reports for bank with id ${bankId}`);
        }
        return res.status(200).send(lastUploadedReport);
    }
    catch (error) {
        console.error('Unable to get last uploaded report %o', error);
        return res.status((_b = (_a = error.response) === null || _a === void 0 ? void 0 : _a.status) !== null && _b !== void 0 ? _b : 500).send({ message: 'Failed to get last uploaded report' });
    }
});
module.exports = {
    getLastUploadedReportByBankId,
};
