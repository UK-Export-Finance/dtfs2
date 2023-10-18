const { extractCsvData } = require('../../../utils/csv-utils');
const { validateCsvData } = require('./utilisation-report-validator');
const api = require('../../../api');

const getUtilisationReportUpload = async (req, res) => {
  try {
    return res.render('utilisation-report-service/utilisation-report-upload/utilisation-report-upload.njk', {
      user: req.session.user,
      primaryNav: 'utilisation_report_upload',
    });
  } catch (error) {
    return res.render('_partials/problem-with-service.njk', { user: req.session.user });
  }
};

const getUploadErrors = (req, res) => {
  let uploadValidationError;
  let uploadErrorSummary;
  if (res?.locals?.fileUploadError) {
    uploadErrorSummary = [
      {
        text: res?.locals?.fileUploadError?.text,
        href: '#utilisation-report-file-upload',
      },
    ];
    uploadValidationError = res?.locals?.fileUploadError;
  } else if (!req?.file) {
    uploadErrorSummary = [
      {
        text: 'You must upload a file',
        href: '#utilisation-report-file-upload',
      },
    ];
    uploadValidationError = { text: 'You must upload a file' };
  }
  return { uploadErrorSummary, uploadValidationError };
};

const postUtilisationReportUpload = async (req, res) => {
  try {
    const { uploadErrorSummary, uploadValidationError } = getUploadErrors(req, res);
    if (uploadValidationError || uploadErrorSummary) {
      return res.render('utilisation-report-service/utilisation-report-upload/utilisation-report-upload.njk', {
        validationError: uploadValidationError,
        errorSummary: uploadErrorSummary,
        user: req.session.user,
        primaryNav: 'utilisation_report_upload',
      });
    }

    // File is valid so we can start processing and validating its data
    const { csvJson, fileBuffer } = await extractCsvData(req.file);
    const csvValidationErrors = validateCsvData(csvJson);
    if (csvValidationErrors.length > 0) {
      const errorSummary = [
        {
          text: 'You must correct these errors before you can upload the report',
          href: '#validation-errors-table',
        },
      ];
      return res.render('utilisation-report-service/utilisation-report-upload/check-the-report.njk', {
        validationErrors: csvValidationErrors,
        errorSummary,
        filename: req.file.originalname,
        user: req.session.user,
        primaryNav: 'utilisation_report_upload',
      });
    }
    req.session.utilisation_report = { fileBuffer, fileName: req.file.originalname, month: 1, year: 2023, reportData: csvJson };
    return res.redirect('/utilisation-report-upload/confirm-and-send');
  } catch (error) {
    return res.render('_partials/problem-with-service.njk', { user: req.session.user });
  }
};

const getReportConfirmAndSend = async (req, res) => {
  try {
    return res.render('utilisation-report-service/utilisation-report-upload/confirm-and-send.njk', {
      user: req.session.user,
      primaryNav: 'utilisation_report_upload',
      fileName: req.session.utilisation_report.fileName,
    });
  } catch (error) {
    return res.render('_partials/problem-with-service.njk', { user: req.session.user });
  }
};

const postReportConfirmAndSend = async (req, res) => {
  try {
    // TODO FN-1103 save file
    const { user, userToken, utilisation_report } = req.session;
    const { fileBuffer, fileName, month, year, reportData } = utilisation_report;
    // call API and then choose what to show back depending on response

    console.log(fileBuffer);
    console.log(fileBuffer.length);
    console.log(reportData);
    console.log(fileName);
    console.log(month);
    console.log(year);
    console.log(user);
    console.log(userToken);

    const result = await api.uploadUtilisationReportData(user, month, year, reportData, fileBuffer,  userToken);
    if (result.status === 200) {
      return res.redirect('/utilisation-report-upload/confirmation');
    }
    console.error('Error saving utilisation report: %O', result)
    return res.render('_partials/problem-with-service.njk', { user: req.session.user });
  } catch (error) {
    console.error('Error saving utilisation report: %O', error);
    return res.render('_partials/problem-with-service.njk', { user: req.session.user });
  }
};

const getReportConfirmation = async (req, res) => {
  try {
    // TODO FN-1103 get reportMonthYear and bankEmail from DB
    const reportMonthYear = 'June 2023';
    const bankEmail = 'tradefinance@barclays.com';
    return res.render('utilisation-report-service/utilisation-report-upload/confirmation.njk', {
      user: req.session.user,
      primaryNav: 'utilisation_report_upload',
      reportMonthYear,
      bankEmail,
    });
  } catch (error) {
    console.error(error);
    return res.render('_partials/problem-with-service.njk', { user: req.session.user });
  }
};

module.exports = {
  getUtilisationReportUpload,
  postUtilisationReportUpload,
  getReportConfirmAndSend,
  postReportConfirmAndSend,
  getReportConfirmation,
};
