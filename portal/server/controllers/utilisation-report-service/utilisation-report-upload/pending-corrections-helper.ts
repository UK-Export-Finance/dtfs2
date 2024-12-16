import { getFormattedReportPeriodWithLongMonth, PortalSessionUser, ReportPeriod } from '@ukef/dtfs2-common';
import { addMonths, format, isBefore, startOfMonth } from 'date-fns';
import { NextActionViewModel, PendingCorrectionsViewModel } from '../../../types/view-models/pending-corrections';
import { NonEmptyPendingCorrectionsResponseBody, UtilisationReportPendingCorrectionsResponseBody } from '../../../api-response-types';
import { PRIMARY_NAV_KEY } from '../../../constants';

/**
 * Constructs a NextActionViewModel from a the next due report period
 * - If the submission period for the next due report period starts in the past,
 *   the next action will be that the report is currently due for upload
 * - If the submission period for the next due report period starts in the future,
 *   the next action will be that the report is soon to be due for upload
 * @param nextDueReportPeriod - The report period for which a report will need to be uploaded
 * @returns the view model for the next action
 */
export const mapNextDueReportPeriodToNextActionViewModel = (nextDueReportPeriod: ReportPeriod): NextActionViewModel => {
  const dateInMonthAfterReportPeriodEnd = addMonths(new Date(nextDueReportPeriod.end.year, nextDueReportPeriod.end.month - 1), 1);
  const nextDueReportPeriodSubmissionStartDate = startOfMonth(dateInMonthAfterReportPeriodEnd);
  const today = new Date();

  if (isBefore(nextDueReportPeriodSubmissionStartDate, today)) {
    return {
      reportCurrentlyDueForUpload: {
        formattedReportPeriod: getFormattedReportPeriodWithLongMonth(nextDueReportPeriod),
      },
    };
  }

  const formattedSubmissionDate = format(nextDueReportPeriodSubmissionStartDate, 'd MMMM yyyy');

  return {
    reportSoonToBeDueForUpload: {
      formattedReportPeriod: getFormattedReportPeriodWithLongMonth(nextDueReportPeriod),
      formattedUploadFromDate: formattedSubmissionDate,
    },
  };
};

/**
 * Maps a non empty pending corrections response and user to a PendingCorrectionsViewModel
 * @param pendingCorrectionsResponse - The response containing the pending corrections
 * @param user - The user that is currently logged in
 * @returns the view model for the pending corrections
 */
export const mapToPendingCorrectionsViewModel = (
  pendingCorrectionsResponse: NonEmptyPendingCorrectionsResponseBody,
  user: PortalSessionUser,
): PendingCorrectionsViewModel => {
  const { reportPeriod, uploadedByFullName, dateUploaded, corrections, nextDueReportPeriod } = pendingCorrectionsResponse;

  return {
    user,
    primaryNav: PRIMARY_NAV_KEY.UTILISATION_REPORT_UPLOAD,
    formattedReportPeriod: getFormattedReportPeriodWithLongMonth(reportPeriod),
    uploadedByFullName,
    formattedDateUploaded: format(new Date(dateUploaded), 'd MMMM yyyy'),
    corrections,
    nextAction: mapNextDueReportPeriodToNextActionViewModel(nextDueReportPeriod),
  };
};

/**
 * Type guard for UtilisationReportPendingCorrectionsResponseBody
 * @param responseBody - The response from the api
 * @returns true if the response body contains pending corrections and false otherwise
 */
export const isNonEmptyPendingCorrectionsResponseBody = (
  responseBody: UtilisationReportPendingCorrectionsResponseBody,
): responseBody is NonEmptyPendingCorrectionsResponseBody => {
  return Object.keys(responseBody).length > 0;
};
