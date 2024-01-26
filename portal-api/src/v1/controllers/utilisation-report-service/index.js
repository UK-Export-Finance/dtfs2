const { getReportDownload } = require('./utilisation-report-download.controller');
const { uploadReportAndSendNotification } = require('./utilisation-report-upload.controller');
const { getPreviousReportsByBankId } = require('./previous-reports.controller');
const { getDueReportDates } = require('./due-report-dates.controller');
const { getLatestReport } = require('./latest-report.controller');

module.exports = {
  getReportDownload,
  uploadReportAndSendNotification,
  getPreviousReportsByBankId,
  getDueReportDates,
  getLatestReport,
};
