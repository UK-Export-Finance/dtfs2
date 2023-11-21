const { uploadReportAndSendNotification } = require('./utilisation-report-upload.controller');
const { getPreviousReportsByBankId } = require('./previous-reports.controller');
const { getDueReportDates } = require('./due-report-dates.controller');
const { getLatestReport } = require('./latest-report.controller');

module.exports = {
  uploadReportAndSendNotification,
  getPreviousReportsByBankId,
  getDueReportDates,
  getLatestReport,
};
