const { format, startOfMonth, addMonths } = require('date-fns');
const { getFormattedReportPeriodWithLongMonth } = require('@ukef/dtfs2-common');
const { extractCsvData, removeCellAddressesFromArray } = require('../../../utils/csv-utils');
const { getUploadErrors } = require('./utilisation-report-upload-errors');
const { getDueReportPeriodsByBankId, getReportDueDate } = require('./utilisation-report-status');
const api = require('../../../api');
const { getReportAndUserDetails } = require('./utilisation-report-details');
const { PRIMARY_NAV_KEY } = require('../../../constants');
const { filterReportJsonToRelevantKeys } = require('../../../helpers/filterReportJsonToRelevantKeys');

const setSessionUtilisationReport = (req, nextDueReportPeriod) => {
  req.session.utilisationReport = {
    reportPeriod: {
      start: {
        month: nextDueReportPeriod.start.month,
        year: nextDueReportPeriod.start.year,
      },
      end: {
        month: nextDueReportPeriod.end.month,
        year: nextDueReportPeriod.end.year,
      },
    },
    formattedReportPeriod: nextDueReportPeriod.formattedReportPeriod,
  };
};

/**
 * @typedef {import('./utilisation-report-details').ReportAndUserDetails} ReportAndUserDetails
 *
 * @typedef {Object} NextReportPeriodDetails
 * @property {string} nextReportPeriod - The upcoming report period (the current month) with format 'MMMM yyyy'
 * @property {string} nextReportPeriodSubmissionStart - The start of the month when the next report period report can be submitted with format 'd MMMM yyyy'
 *
 * @typedef {NextReportPeriodDetails & ReportAndUserDetails} ReportDetails
 */

/**
 * Gets details about the utilisation report which was most
 * recently uploaded to the bank with the bank ID provided
 * @param {string} userToken - Token to validate session
 * @param {string} bankId - ID of the bank
 * @returns {Promise<ReportDetails>}
 */
const getLastUploadedReportDetails = async (userToken, bankId) => {
  const lastUploadedReport = await api.getLastUploadedReportByBankId(userToken, bankId);
  const reportAndUserDetails = getReportAndUserDetails(lastUploadedReport);

  const nextReportPeriod = await api.getNextReportPeriodByBankId(userToken, bankId);
  const formattedNextReportPeriod = getFormattedReportPeriodWithLongMonth(nextReportPeriod);

  const nextReportPeriodSubmissionEndDate = addMonths(new Date(nextReportPeriod.end.year, nextReportPeriod.end.month - 1), 1);
  const nextReportPeriodSubmissionStart = format(startOfMonth(nextReportPeriodSubmissionEndDate), 'd MMMM yyyy');

  return { ...reportAndUserDetails, formattedNextReportPeriod, nextReportPeriodSubmissionStart };
};

const getUtilisationReportUpload = async (req, res) => {
  const { user, userToken } = req.session;
  const bankId = user.bank.id;
  try {
    const dueReportPeriods = await getDueReportPeriodsByBankId(userToken, bankId);
    if (dueReportPeriods.length > 0) {
      const nextDueReportPeriod = dueReportPeriods[0];
      setSessionUtilisationReport(req, nextDueReportPeriod);
      const reportPeriodEndDate = new Date(nextDueReportPeriod.end.year, nextDueReportPeriod.end.month - 1);
      const nextDueReportDueDate = await getReportDueDate(userToken, reportPeriodEndDate);
      return res.render('utilisation-report-service/utilisation-report-upload/utilisation-report-upload.njk', {
        user,
        primaryNav: PRIMARY_NAV_KEY.UTILISATION_REPORT_UPLOAD,
        dueReportPeriods,
        nextDueReportDueDate,
      });
    }

    const lastUploadedReportDetails = await getLastUploadedReportDetails(userToken, bankId);
    return res.render('utilisation-report-service/utilisation-report-upload/utilisation-report-upload.njk', {
      user,
      primaryNav: PRIMARY_NAV_KEY.UTILISATION_REPORT_UPLOAD,
      dueReportPeriods,
      ...lastUploadedReportDetails,
    });
  } catch (error) {
    console.error('Failed to render utilisation-report-upload:', error);
    return res.render('_partials/problem-with-service.njk', { user });
  }
};

const renderPageWithError = (req, res, errorSummary, validationError, dueReportPeriods) => {
  if (req.query?.check_the_report) {
    return res.render('utilisation-report-service/utilisation-report-upload/check-the-report.njk', {
      fileUploadError: validationError,
      errorSummary,
      user: req.session.user,
      primaryNav: PRIMARY_NAV_KEY.UTILISATION_REPORT_UPLOAD,
    });
  }
  return res.render('utilisation-report-service/utilisation-report-upload/utilisation-report-upload.njk', {
    validationError,
    errorSummary,
    user: req.session.user,
    primaryNav: PRIMARY_NAV_KEY.UTILISATION_REPORT_UPLOAD,
    dueReportPeriods,
  });
};

const postUtilisationReportUpload = async (req, res) => {
  const { user, userToken } = req.session;
  const bankId = user.bank.id;

  try {
    const uploadErrors = getUploadErrors(req, res);
    if (uploadErrors) {
      const { uploadErrorSummary, uploadValidationError } = uploadErrors;

      const dueReportPeriods = await getDueReportPeriodsByBankId(userToken, bankId);
      return renderPageWithError(req, res, uploadErrorSummary, uploadValidationError, dueReportPeriods);
    }

    // File is valid so we can start processing and validating its data
    const { csvJson, fileBuffer, error } = await extractCsvData(req.file);
    if (error) {
      const extractDataErrorSummary = [
        {
          text: 'The selected file could not be uploaded, try again and make sure it is not password protected',
          href: '#utilisation-report-file-upload',
        },
      ];
      const extractDataError = {
        text: 'The selected file could not be uploaded, try again and make sure it is not password protected',
      };
      const dueReportPeriods = await getDueReportPeriodsByBankId(userToken, bankId);
      return renderPageWithError(req, res, extractDataErrorSummary, extractDataError, dueReportPeriods);
    }

    if (!csvJson.length) {
      throw new Error('Report data is empty');
    }

    // We filter down the JSON to only send the necessary data to the API for validation
    // An array of empty objects is a valid payload to send to the API to get missing headers errors
    const filteredCsvJson = filterReportJsonToRelevantKeys(csvJson);

    const { csvValidationErrors } = await api.generateValidationErrorsForUtilisationReportData(filteredCsvJson, bankId, userToken);

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
        primaryNav: PRIMARY_NAV_KEY.UTILISATION_REPORT_UPLOAD,
      });
    }

    req.session.utilisationReport = {
      ...req.session.utilisationReport,
      fileBuffer,
      filename: req.file.originalname,
      reportData: filteredCsvJson,
      bankName: req.session.user.bank.name,
      submittedBy: `${user.firstname} ${user.surname}`,
    };

    return res.redirect('/utilisation-report-upload/confirm-and-send');
  } catch (error) {
    console.error('Failed to upload utilisation report:', error);
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
      primaryNav: PRIMARY_NAV_KEY.UTILISATION_REPORT_UPLOAD,
      filename: req.session.utilisationReport.filename,
    });
  } catch (error) {
    return res.render('_partials/problem-with-service.njk', { user: req.session.user });
  }
};

const postReportConfirmAndSend = async (req, res) => {
  try {
    const { user, userToken, utilisationReport } = req.session;
    const { fileBuffer, reportPeriod, reportData, formattedReportPeriod } = utilisationReport;

    const mappedReportData = removeCellAddressesFromArray(reportData);

    const response = await api.uploadUtilisationReportData(user, reportPeriod, mappedReportData, fileBuffer, formattedReportPeriod, userToken);

    if (response?.status === 200 || response?.status === 201) {
      const { paymentOfficerEmails } = response.data;
      req.session.utilisationReport = {
        ...req.session.utilisationReport,
        paymentOfficerEmails,
      };
      return res.redirect('/utilisation-report-upload/confirmation');
    }
    console.error('Error saving utilisation report %o', response);
    return res.render('_partials/problem-with-service.njk', { user: req.session.user });
  } catch (error) {
    console.error('Error saving utilisation report %o', error);
    return res.render('_partials/problem-with-service.njk', { user: req.session.user });
  }
};

const getReportConfirmation = async (req, res) => {
  try {
    if (!req.session.utilisationReport) {
      return res.redirect('/utilisation-report-upload');
    }
    const { formattedReportPeriod, paymentOfficerEmails } = req.session.utilisationReport;
    delete req.session.utilisationReport;
    return res.render('utilisation-report-service/utilisation-report-upload/confirmation.njk', {
      user: req.session.user,
      primaryNav: PRIMARY_NAV_KEY.UTILISATION_REPORT_UPLOAD,
      reportPeriod: formattedReportPeriod,
      paymentOfficerEmails,
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
