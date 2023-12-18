const { getReportDownload } = require('./utilisation-report-download.controller');
const { uploadReportAndSendNotification } = require('./utilisation-report-upload.controller');
const { getPreviousReportsByBankId } = require('./previous-reports.controller');
const { getDueReportDates } = require('./due-report-dates.controller');
const { getLatestReport } = require('./latest-report.controller');
const { getReportFrequencyFromBank } = require('./utilisation-report-upload.controller');

module.exports = {
  getReportDownload,
  uploadReportAndSendNotification,
  getPreviousReportsByBankId,
  getDueReportDates,
  getLatestReport,
  getReportFrequencyFromBank,
};
