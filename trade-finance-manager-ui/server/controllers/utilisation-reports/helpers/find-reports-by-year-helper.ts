import { format, parseISO } from 'date-fns';
import { getFormattedReportPeriodWithLongMonth } from '@ukef/dtfs2-common';
import { UtilisationReportReconciliationSummaryItem } from '@tfm-ui/types/utilisation-reports';
import { FindReportSummaryItemViewModel } from '@tfm-ui/types/view-models';
import { reconciliationStatusCodeToDisplayStatus } from './reconciliation-summary-helper';

export const getFindReportSummaryItemViewModel = (apiItem: UtilisationReportReconciliationSummaryItem): FindReportSummaryItemViewModel => {
  const { status, dateUploaded, reportPeriod } = apiItem;

  return {
    ...apiItem,
    formattedReportPeriod: getFormattedReportPeriodWithLongMonth(reportPeriod),
    displayStatus: reconciliationStatusCodeToDisplayStatus[status],
    formattedDateUploaded: dateUploaded ? format(parseISO(dateUploaded), 'd MMM yyyy') : undefined,
  };
};
