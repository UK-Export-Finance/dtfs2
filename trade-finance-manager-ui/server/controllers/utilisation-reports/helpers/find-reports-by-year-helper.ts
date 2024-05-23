import { format, parseISO } from 'date-fns';
import { getFormattedReportPeriodWithLongMonth } from '@ukef/dtfs2-common';
import { UtilisationReportReconciliationSummaryItem } from '../../../types/utilisation-reports';
import { reconciliationStatusCodeToDisplayStatus } from './reconciliation-summary-helper';

type ReportViewModel = UtilisationReportReconciliationSummaryItem & {
  formattedReportPeriod: string;
  displayStatus: string;
  formattedDateUploaded?: string;
};

export const getReportViewModel = (apiItem: UtilisationReportReconciliationSummaryItem): ReportViewModel => {
  const { status, dateUploaded, reportPeriod } = apiItem;

  return {
    ...apiItem,
    formattedReportPeriod: getFormattedReportPeriodWithLongMonth(reportPeriod),
    displayStatus: reconciliationStatusCodeToDisplayStatus[status],
    formattedDateUploaded: dateUploaded ? format(parseISO(dateUploaded), 'd MMM yyyy') : undefined,
  };
};
