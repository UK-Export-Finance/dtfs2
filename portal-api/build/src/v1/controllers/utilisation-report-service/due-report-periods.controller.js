"use strict";
const tslib_1 = require("tslib");
const api = require('../../api');
const { UTILISATION_REPORT_RECONCILIATION_STATUS } = require('../../../constants');
/**
 * Calls the DTFS Central API to get a banks utilisation reports and
 * returns the report period for reports with status `REPORT_NOT_RECEIVED`
 */
const getDueReportPeriodsByBankId = (req, res) => tslib_1.__awaiter(void 0, void 0, void 0, function* () {
    var _a, _b;
    try {
        const { bankId } = req.params;
        const notReceivedReports = (yield api.getUtilisationReports(bankId)).filter((report) => report.status === UTILISATION_REPORT_RECONCILIATION_STATUS.REPORT_NOT_RECEIVED);
        const dueReportPeriods = notReceivedReports.map((notReceivedReport) => notReceivedReport.reportPeriod);
        return res.status(200).send(dueReportPeriods);
    }
    catch (error) {
        console.error('Cannot get due reports %o', error);
        return res.status((_b = (_a = error.response) === null || _a === void 0 ? void 0 : _a.status) !== null && _b !== void 0 ? _b : 500).send({ message: 'Failed to get due reports' });
    }
});
module.exports = {
    getDueReportPeriodsByBankId,
};
