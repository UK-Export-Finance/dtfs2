const {
  getUtilisationReportUpload,
  postUtilisationReportUpload,
  getReportConfirmAndSend,
  postReportConfirmAndSend,
  getReportConfirmation,
} = require('./utilisation-report-upload');
const { getPreviousReports } = require('./previous-reports');

module.exports = {
  getUtilisationReportUpload,
  postUtilisationReportUpload,
  getPreviousReports,
  getReportConfirmAndSend,
  postReportConfirmAndSend,
  getReportConfirmation,
};
