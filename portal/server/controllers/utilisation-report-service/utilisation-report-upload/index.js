const { format } = require('date-fns');
const { extractCsvData, removeCellAddressesFromArray } = require('../../../utils/csv-utils');
const { validateCsvData } = require('./utilisation-report-validator');
const { getReportDueDate } = require('./utilisation-report-status');
const api = require('../../../api');

const getUtilisationReportUpload = async (req, res) => {
  const { user, userToken } = req.session;
  const bankId = user.bank.id;
  try {
    const dueReports = await api.getDueReportsByBank(userToken, bankId);
    const dueReportsWithDetails = dueReports.map((dueReport) => {
      const { month, year } = dueReport;
      const reportPeriod = format(new Date(year, month - 1), 'MMMM yyyy');
      return { ...dueReport, reportPeriod };
    });
    const { reportPeriod, month, year } = dueReportsWithDetails.at(-1);
    req.session.utilisationReport = { reportPeriod, month, year };
    const nextDueReportDueDate = await getReportDueDate(userToken, new Date(year, month - 1));
    return res.render('utilisation-report-service/utilisation-report-upload/utilisation-report-upload.njk', {
      user,
      primaryNav: 'utilisation_report_upload',
      dueReportsWithDetails,
      nextDueReportDueDate,
    });
  } catch (error) {
    return res.render('_partials/problem-with-service.njk', { user });
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
        text: 'Select a file',
        href: '#utilisation-report-file-upload',
      },
    ];
    uploadValidationError = { text: 'Select a file' };
  } else if (res?.locals?.virusScanFailed) {
    uploadErrorSummary = [
      {
        text: 'The selected file could not be uploaded - try again',
        href: '#utilisation-report-file-upload',
      },
    ];
    uploadValidationError = { text: 'The selected file could not be uploaded – try again' };
  }
  return { uploadErrorSummary, uploadValidationError };
};

const renderPageWithError = (req, res, errorSummary, validationError) => {
  if (req.query?.check_the_report) {
    return res.render('utilisation-report-service/utilisation-report-upload/check-the-report.njk', {
      fileUploadError: validationError,
      errorSummary,
      user: req.session.user,
      primaryNav: 'utilisation_report_upload',
    });
  }
  return res.render('utilisation-report-service/utilisation-report-upload/utilisation-report-upload.njk', {
    validationError,
    errorSummary,
    user: req.session.user,
    primaryNav: 'utilisation_report_upload',
  });
};

const postUtilisationReportUpload = async (req, res) => {
  const { user } = req.session;
  try {
    const { uploadErrorSummary, uploadValidationError } = getUploadErrors(req, res);
    if (uploadValidationError || uploadErrorSummary) {
      return renderPageWithError(req, res, uploadErrorSummary, uploadValidationError);
    }

    // File is valid so we can start processing and validating its data
    const { csvJson, fileBuffer, error } = await extractCsvData(req.file); // do we here catch some errors and return generic something went wrong here?
    if (error) {
      const extractDataErrorSummary = [
        {
          text: 'The selected file could not be uploaded, try again and make sure it is not password protected',
          href: '#utilisation-report-file-upload',
        },
      ];
      const extractDataError = { text: 'The selected file could not be uploaded, try again and make sure it is not password protected' };
      return renderPageWithError(req, res, extractDataErrorSummary, extractDataError);
    }
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
        user,
        primaryNav: 'utilisation_report_upload',
      });
    }
    req.session.utilisationReport = {
      ...req.session.utilisationReport,
      fileBuffer,
      fileName: req.file.originalname,
      reportData: csvJson,
      bankName: req.session.user.bank.name,
      submittedBy: `${user.firstname} ${user.surname}`,
    };
    return res.redirect('/utilisation-report-upload/confirm-and-send');
  } catch (error) {
    return res.render('_partials/problem-with-service.njk', { user });
  }
};

const getReportConfirmAndSend = async (req, res) => {
  try {
    if (!req.session.utilisationReport) {
      return res.redirect('/utilisation-report-upload');
    }

    return res.render('utilisation-report-service/utilisation-report-upload/confirm-and-send.njk', {
      user: req.session.user,
      primaryNav: 'utilisation_report_upload',
      fileName: req.session.utilisationReport.fileName,
    });
  } catch (error) {
    return res.render('_partials/problem-with-service.njk', { user: req.session.user });
  }
};

const postReportConfirmAndSend = async (req, res) => {
  try {
    const { user, userToken, utilisationReport } = req.session;
    const { fileBuffer, month, year, reportData, reportPeriod } = utilisationReport;

    const mappedReportData = removeCellAddressesFromArray(reportData);

    const response = await api.uploadUtilisationReportData(user, month, year, mappedReportData, fileBuffer, reportPeriod, userToken);

    if (response?.status === 200 || response?.status === 201) {
      const { paymentOfficerEmail } = response.data;
      req.session.utilisationReport = {
        ...req.session.utilisationReport,
        paymentOfficerEmail,
      };
      return res.redirect('/utilisation-report-upload/confirmation');
    }
    console.error('Error saving utilisation report: %O', response);
    return res.render('_partials/problem-with-service.njk', { user: req.session.user });
  } catch (error) {
    console.error('Error saving utilisation report: %O', error);
    return res.render('_partials/problem-with-service.njk', { user: req.session.user });
  }
};

const getReportConfirmation = async (req, res) => {
  try {
    if (!req.session.utilisationReport) {
      return res.redirect('/utilisation-report-upload');
    }
    const { reportPeriod, paymentOfficerEmail } = req.session.utilisationReport;
    delete req.session.utilisationReport;
    return res.render('utilisation-report-service/utilisation-report-upload/confirmation.njk', {
      user: req.session.user,
      primaryNav: 'utilisation_report_upload',
      reportPeriod,
      paymentOfficerEmail,
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
