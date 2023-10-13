const { uploadReportAndSendNotification } = require('./utilisation-report-upload.controller');
const { getPreviousReportsByBankId } = require('./previous-reports.controller');

module.exports = {
  uploadReportAndSendNotification,
  getPreviousReportsByBankId
};
