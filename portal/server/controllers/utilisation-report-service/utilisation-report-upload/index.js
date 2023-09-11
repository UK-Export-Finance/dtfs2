const getUtilisationReportUpload = async (req, res) => {
  try {
    return res.render('utilisation-reporting-service/utilisation-report-upload/utilisation-report-upload.njk', {
      user: req.session.user,
      primaryNav: 'utilisation_report_upload',
    });
  } catch (error) {
    return res.render('_partials/problem-with-service.njk', { user: req.session.user });
  }
};

const postUtilisationReportUpload = async (req, res) => {
  try {
    if (res?.locals?.fileUploadError) {
      const errorSummary = [
        {
          text: res?.locals?.fileUploadError?.text,
          href: '#utilisation-report-file-upload',
        },
      ];
      return res.render('utilisation-reporting-service/utilisation-report-upload/utilisation-report-upload.njk', {
        validationError: res?.locals?.fileUploadError,
        errorSummary,
        user: req.session.user,
        primaryNav: 'utilisation_report_upload',
      });
    }
    return res.render('utilisation-reporting-service/utilisation-report-upload/utilisation-report-upload.njk', {
      user: req.session.user,
      primaryNav: 'utilisation_report_upload',
    });
  } catch (error) {
    return res.render('_partials/problem-with-service.njk', { user: req.session.user });
  }
};

module.exports = {
  getUtilisationReportUpload,
  postUtilisationReportUpload,
};
