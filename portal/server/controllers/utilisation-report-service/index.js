const { getUtilisationReportUpload, postUtilisationReportUpload } = require('./utilisation-report-upload');
const { getUtilisationReportDownload } = require('./previous-reports');

module.exports = {
  getUtilisationReportUpload,
  postUtilisationReportUpload,
  getUtilisationReportDownload,
};
