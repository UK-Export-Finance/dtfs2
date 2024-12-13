import { getFormattedReportPeriodWithLongMonth, PortalSessionUser, ReportPeriod } from '@ukef/dtfs2-common';
import { addMonths, format, isBefore, startOfMonth } from 'date-fns';
import { NextActionViewModel, PendingCorrectionsViewModel } from '../../../types/view-models/pending-corrections';
import { UtilisationReportPendingCorrectionsResponseBody } from '../../../api-response-types';
import { PRIMARY_NAV_KEY } from '../../../constants';

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

export const mapToPendingCorrectionsViewModel = (
  pendingCorrectionsResponse: UtilisationReportPendingCorrectionsResponseBody,
  user: PortalSessionUser,
): PendingCorrectionsViewModel => {
  const { reportPeriod, uploadedByUserName, dateUploaded, corrections, nextDueReportPeriod } = pendingCorrectionsResponse;

  return {
    user,
    primaryNav: PRIMARY_NAV_KEY.UTILISATION_REPORT_UPLOAD,
    formattedReportPeriod: getFormattedReportPeriodWithLongMonth(reportPeriod),
    uploadedByUserName,
    formattedDateUploaded: format(new Date(dateUploaded), 'd MMMM yyyy'),
    corrections,
    nextAction: mapNextDueReportPeriodToNextActionViewModel(nextDueReportPeriod),
  };
};
