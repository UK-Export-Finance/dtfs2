const { convertToCsv } = require('../../../utils/csv-utils');
const { validateCsvData } = require('./utilisation-report-validator');

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
    let uploadValidationError;
    let errorSummary;
    if (res?.locals?.fileUploadError) {
      errorSummary = [
        {
          text: res?.locals?.fileUploadError?.text,
          href: '#utilisation-report-file-upload',
        },
      ];
      uploadValidationError = res?.locals?.fileUploadError;
    } else if (!req?.file) {
      errorSummary = [
        {
          text: 'You must upload a file',
          href: '#utilisation-report-file-upload',
        },
      ];
      uploadValidationError = { text: 'You must upload a file' };
    }
    if (uploadValidationError || errorSummary) {
      return res.render('utilisation-reporting-service/utilisation-report-upload/utilisation-report-upload.njk', {
        validationError: uploadValidationError,
        errorSummary,
        user: req.session.user,
        primaryNav: 'utilisation_report_upload',
      });
    }

    // File is valid so we can start processing and validating it
    const { csvJson, fileBuffer } = await convertToCsv(req.file);
    const csvValidationErrors = validateCsvData(csvJson);
    if (csvValidationErrors.length > 0) {
      errorSummary = [
        {
          text: 'You must correct these errors before you can upload the report',
          href: '#validation-errors-table',
        },
      ];
      return res.render('utilisation-reporting-service/utilisation-report-upload/check-the-report.njk', {
        validationErrors: csvValidationErrors,
        errorSummary,
        filename: req.file.originalname,
        user: req.session.user,
        primaryNav: 'utilisation_report_upload',
      });
    }
    req.session.utilisation_report = { fileBuffer, fileName: req.file.originalname };
    return res.render('utilisation-reporting-service/utilisation-report-upload/confirm-report-upload.njk');
  } catch (error) {
    console.error(error);
    return res.render('_partials/problem-with-service.njk', { user: req.session.user });
  }
};

module.exports = {
  getUtilisationReportUpload,
  postUtilisationReportUpload,
};
