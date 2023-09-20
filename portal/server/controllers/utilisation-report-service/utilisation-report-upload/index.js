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
    let validationError;
    let errorSummary;
    if (res?.locals?.fileUploadError) {
      errorSummary = [
        {
          text: res?.locals?.fileUploadError?.text,
          href: '#utilisation-report-file-upload',
        },
      ];
      validationError = res?.locals?.fileUploadError;
    } else if (!req?.file) {
      errorSummary = [
        {
          text: 'You must upload a file',
          href: '#utilisation-report-file-upload',
        },
      ];
      validationError = { text: 'You must upload a file' };
    }
    if (validationError || errorSummary) {
      return res.render('utilisation-reporting-service/utilisation-report-upload/utilisation-report-upload.njk', {
        validationError,
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
