const getUtilisationReportUpload = async (req, res) => {
  try {
    return res.render('utilisation-reporting-service/partials/utilisation-report-upload.njk');
  } catch (error) {
    return res.render('partials/problem-with-service.njk');
  }
};

const postUtilisationReportUpload = async (req, res) => {
  try {
    if (res.locals.fileUploadError) {
      return res.render('utilisation-reporting-service/partials/utilisation-report-upload.njk', {
        error: res.locals.fileUploadError,
      });
    }
    return res.render('utilisation-reporting-service/partials/utilisation-report-upload.njk');
  } catch (error) {
    return res.render('partials/problem-with-service.njk');
  }
};

module.exports = {
  getUtilisationReportUpload,
  postUtilisationReportUpload,
};
