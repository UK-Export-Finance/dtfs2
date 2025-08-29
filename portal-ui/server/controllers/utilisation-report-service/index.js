const { getReportDownload } = require('./utilisation-report-download');
const {
  getUtilisationReportUpload,
  postUtilisationReportUpload,
  getReportConfirmAndSend,
  postReportConfirmAndSend,
  getReportConfirmation,
} = require('./utilisation-report-upload');
const { getPreviousReports } = require('./previous-reports');
const { getProvideUtilisationReportCorrection } = require('./record-correction');

module.exports = {
  getReportDownload,
  getUtilisationReportUpload,
  postUtilisationReportUpload,
  getReportConfirmAndSend,
  postReportConfirmAndSend,
  getReportConfirmation,
  getPreviousReports,
  getProvideUtilisationReportCorrection,
};
