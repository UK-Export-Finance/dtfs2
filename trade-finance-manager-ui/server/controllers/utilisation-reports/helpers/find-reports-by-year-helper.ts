import { format, parseISO } from 'date-fns';
import { getFormattedReportPeriodWithLongMonth } from '@ukef/dtfs2-common';
import { UtilisationReportReconciliationSummaryItem } from '../../../types/utilisation-reports';
import { reconciliationStatusCodeToDisplayStatus } from './reconciliation-summary-helper';

export type FindReportSummaryItemViewModel = UtilisationReportReconciliationSummaryItem & {
  formattedReportPeriod: string;
  displayStatus: string;
  formattedDateUploaded?: string;
};

export const getFindReportSummaryItemViewModel = (apiItem: UtilisationReportReconciliationSummaryItem): FindReportSummaryItemViewModel => {
  const { status, dateUploaded, reportPeriod } = apiItem;

  return {
    ...apiItem,
    formattedReportPeriod: getFormattedReportPeriodWithLongMonth(reportPeriod),
    displayStatus: reconciliationStatusCodeToDisplayStatus[status],
    formattedDateUploaded: dateUploaded ? format(parseISO(dateUploaded), 'd MMM yyyy') : undefined,
  };
};
