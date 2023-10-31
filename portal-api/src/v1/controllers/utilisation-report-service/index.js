const { uploadReportAndSendNotification } = require('./utilisation-report-upload.controller');
const { getPreviousReportsByBankId } = require('./previous-reports.controller');
const { getDueReports } = require('./due-reports.controller');

module.exports = {
  uploadReportAndSendNotification,
  getPreviousReportsByBankId,
  getDueReports,
};
