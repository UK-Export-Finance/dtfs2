const { getUtilisationReportUpload, postUtilisationReportUpload } = require('./utilisation-report-upload');
const { getPreviousReports } = require('./previous-reports');

module.exports = {
  getUtilisationReportUpload,
  postUtilisationReportUpload,
  getPreviousReports,
};
