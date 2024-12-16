import { Request, Response } from 'express';
import { format, startOfMonth, addMonths } from 'date-fns';
import { getFormattedReportPeriodWithLongMonth, isFeeRecordCorrectionFeatureFlagEnabled, ReportPeriod } from '@ukef/dtfs2-common';
import { extractCsvData, removeCellAddressesFromArray } from '../../../utils/csv-utils';
import { getUploadErrors, UtilisationReportUploadErrors } from './utilisation-report-upload-errors';
import { getDueReportPeriodsByBankId, getReportDueDate } from './utilisation-report-status';
import api from '../../../api';
import { getReportAndUserDetails, ReportAndUserDetails } from './utilisation-report-details';
import { PRIMARY_NAV_KEY } from '../../../constants';
import { filterReportJsonToRelevantKeys } from '../../../helpers/filterReportJsonToRelevantKeys';
import { asLoggedInUserSession, LoggedInUserSession } from '../../../helpers/express-session';
import { mapToPendingCorrectionsViewModel } from './pending-corrections-helper';
import { UtilisationReportPendingCorrectionsResponseBody } from '../../../api-response-types';

const setSessionUtilisationReport = (req: Request, nextDueReportPeriod: ReportPeriod & { formattedReportPeriod: string }) => {
  (req.session as LoggedInUserSession).utilisationReport = {
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

type NextReportPeriodDetails = {
  /**
   * The upcoming report period (the current month) with format 'MMMM yyyy'
   */
  formattedNextReportPeriod: string;
  /**
   * The start of the month when the next report period report can be submitted with format 'd MMMM yyyy'
   */
  nextReportPeriodSubmissionStart: string;
};

type ReportDetails = ReportAndUserDetails & NextReportPeriodDetails;

/**
 * Gets details about the utilisation report which was most
 * recently uploaded to the bank with the bank ID provided
 * @param userToken - Token to validate session
 * @param bankId - ID of the bank
 * @returns the details of the last uploaded report
 */
const getLastUploadedReportDetails = async (userToken: string, bankId: string): Promise<ReportDetails> => {
  const lastUploadedReport = await api.getLastUploadedReportByBankId(userToken, bankId);
  const reportAndUserDetails = getReportAndUserDetails(lastUploadedReport);

  const nextReportPeriod = await api.getNextReportPeriodByBankId(userToken, bankId);
  const formattedNextReportPeriod = getFormattedReportPeriodWithLongMonth(nextReportPeriod);

  const nextReportPeriodSubmissionEndDate = addMonths(new Date(nextReportPeriod.end.year, nextReportPeriod.end.month - 1), 1);
  const nextReportPeriodSubmissionStart = format(startOfMonth(nextReportPeriodSubmissionEndDate), 'd MMMM yyyy');

  return { ...reportAndUserDetails, formattedNextReportPeriod, nextReportPeriodSubmissionStart };
};

/**
 * Controller for the GET utilisation-report-upload route.
 *
 * If there are pending corrections for a previously uploaded report renders
 * the pending corrections page, otherwise renders the utilisation report upload page.
 *
 * @param req - The request object
 * @param res - The response object
 */
export const getUtilisationReportUpload = async (req: Request, res: Response) => {
  const { user, userToken } = asLoggedInUserSession(req.session);
  const bankId = user.bank.id;

  try {
    if (isFeeRecordCorrectionFeatureFlagEnabled()) {
      const pendingCorrections = await api.getUtilisationReportPendingCorrectionsByBankId(userToken, bankId);

      if (Object.keys(pendingCorrections).length > 0) {
        const viewModel = mapToPendingCorrectionsViewModel(pendingCorrections as UtilisationReportPendingCorrectionsResponseBody, user);
        return res.render('utilisation-report-service/record-corrections/pending-corrections.njk', viewModel);
      }
    }

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

const renderPageWithError = (
  req: Request,
  res: Response,
  errorSummary: UtilisationReportUploadErrors['uploadErrorSummary'],
  validationError: UtilisationReportUploadErrors['uploadValidationError'],
  dueReportPeriods: (ReportPeriod & { formattedReportPeriod: string })[],
) => {
  const { user } = asLoggedInUserSession(req.session);

  if (req.query?.check_the_report) {
    return res.render('utilisation-report-service/utilisation-report-upload/check-the-report.njk', {
      fileUploadError: validationError,
      errorSummary,
      user,
      primaryNav: PRIMARY_NAV_KEY.UTILISATION_REPORT_UPLOAD,
    });
  }
  return res.render('utilisation-report-service/utilisation-report-upload/utilisation-report-upload.njk', {
    validationError,
    errorSummary,
    user,
    primaryNav: PRIMARY_NAV_KEY.UTILISATION_REPORT_UPLOAD,
    dueReportPeriods,
  });
};

export const postUtilisationReportUpload = async (req: Request, res: Response) => {
  const { user, userToken, utilisationReport } = asLoggedInUserSession(req.session);
  const bankId = user.bank.id;

  try {
    if (!utilisationReport) {
      throw new Error('No utilisation report data found in session');
    }

    const uploadErrors = getUploadErrors(req, res);
    if (uploadErrors) {
      const { uploadErrorSummary, uploadValidationError } = uploadErrors;

      const dueReportPeriods = await getDueReportPeriodsByBankId(userToken, bankId);
      return renderPageWithError(req, res, uploadErrorSummary, uploadValidationError, dueReportPeriods);
    }

    // File is valid so we can start processing and validating its data
    const file = req.file as Express.Multer.File;
    const { csvJson, fileBuffer, error } = await extractCsvData(file);
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
        filename: file.originalname,
        user,
        primaryNav: PRIMARY_NAV_KEY.UTILISATION_REPORT_UPLOAD,
      });
    }

    (req.session as LoggedInUserSession).utilisationReport = {
      ...utilisationReport,
      fileBuffer,
      filename: file.originalname,
      reportData: filteredCsvJson,
      bankName: user.bank.name,
      submittedBy: `${user.firstname} ${user.surname}`,
    };

    return res.redirect('/utilisation-report-upload/confirm-and-send');
  } catch (error) {
    console.error('Failed to upload utilisation report:', error);
    return res.render('_partials/problem-with-service.njk', { user });
  }
};

/**
 * Controller for the GET utilisation-report-upload/confirm-and-send route.
 * @param req - The request object
 * @param res - The response object
 */
export const getReportConfirmAndSend = (req: Request, res: Response) => {
  const { user, utilisationReport } = asLoggedInUserSession(req.session);

  try {
    if (!utilisationReport) {
      return res.redirect('/utilisation-report-upload');
    }

    return res.render('utilisation-report-service/utilisation-report-upload/confirm-and-send.njk', {
      user,
      primaryNav: PRIMARY_NAV_KEY.UTILISATION_REPORT_UPLOAD,
      filename: utilisationReport.filename,
    });
  } catch (error) {
    return res.render('_partials/problem-with-service.njk', { user });
  }
};

/**
 * Controller for the POST utilisation-report-upload/confirm-and-send route.
 *
 * Redirects to the confirmation page if the report is successfully uploaded,
 * otherwise renders the problem with service page
 *
 * @param req - The request object
 * @param res - The response object
 */
export const postReportConfirmAndSend = async (req: Request, res: Response) => {
  const { user, userToken, utilisationReport } = asLoggedInUserSession(req.session);

  try {
    if (!utilisationReport) {
      throw new Error('No utilisation report data found in session');
    }

    const { fileBuffer, reportPeriod, reportData, formattedReportPeriod } = utilisationReport;

    if (!reportData || !fileBuffer) {
      throw new Error('No report data or file buffer found in session');
    }

    const mappedReportData = removeCellAddressesFromArray(reportData);

    const response = await api.uploadUtilisationReportData(user, reportPeriod, mappedReportData, fileBuffer, formattedReportPeriod, userToken);

    if (response?.status === 200 || response?.status === 201) {
      const { paymentOfficerEmails } = response.data as { paymentOfficerEmails: string[] };
      (req.session as LoggedInUserSession).utilisationReport = {
        ...(req.session as LoggedInUserSession).utilisationReport!,
        paymentOfficerEmails,
      };
      return res.redirect('/utilisation-report-upload/confirmation');
    }
    console.error('Error saving utilisation report %o', response);
    return res.render('_partials/problem-with-service.njk', { user });
  } catch (error) {
    console.error('Error saving utilisation report %o', error);
    return res.render('_partials/problem-with-service.njk', { user });
  }
};

/**
 * Controller for the GET utilisation-report-upload/confirmation route.
 * @param req - The request object
 * @param res - The response object
 */
export const getReportConfirmation = (req: Request, res: Response) => {
  const { user, utilisationReport } = asLoggedInUserSession(req.session);

  try {
    if (!utilisationReport) {
      return res.redirect('/utilisation-report-upload');
    }
    const { formattedReportPeriod, paymentOfficerEmails } = utilisationReport;
    delete (req.session as LoggedInUserSession).utilisationReport;
    return res.render('utilisation-report-service/utilisation-report-upload/confirmation.njk', {
      user,
      primaryNav: PRIMARY_NAV_KEY.UTILISATION_REPORT_UPLOAD,
      reportPeriod: formattedReportPeriod,
      paymentOfficerEmails,
    });
  } catch (error) {
    console.error(error);
    return res.render('_partials/problem-with-service.njk', { user });
  }
};
