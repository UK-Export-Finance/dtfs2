const { uploadReport } = require('./utilisation-report-upload.controller');
const { getPreviousReportsByBankId } = require('./previous-reports.controller');

module.exports = {
  uploadReport,
  getPreviousReportsByBankId
};
