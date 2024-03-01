const { getReportDownload } = require('./utilisation-report-download.controller');
const { uploadReportAndSendNotification } = require('./utilisation-report-upload.controller');
const { getPreviousReportsByBankId } = require('./previous-reports.controller');
const { getDueReportPeriodsByBankId } = require('./due-report-periods.controller');
const { getLastUploadedReportByBankId } = require('./last-uploaded.controller');
const { getNextReportPeriodByBankId } = require('./next-report-period.controller');

module.exports = {
  getReportDownload,
  uploadReportAndSendNotification,
  getPreviousReportsByBankId,
  getDueReportPeriodsByBankId,
  getLastUploadedReportByBankId,
  getNextReportPeriodByBankId,
};
