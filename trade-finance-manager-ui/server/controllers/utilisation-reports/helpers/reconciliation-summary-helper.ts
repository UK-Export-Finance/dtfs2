import { format, parseISO } from 'date-fns';
import { UtilisationReportReconciliationStatus, UtilisationReportReconciliationSummaryItem } from '../../../types/utilisation-reports';

type SummaryItemViewModel = UtilisationReportReconciliationSummaryItem & {
  displayStatus: string;
  formattedDateUploaded?: string;
  downloadPath?: string;
};

const reconciliationStatusCodeToDisplayStatus: Record<UtilisationReportReconciliationStatus, string> = {
  REPORT_NOT_RECEIVED: 'Not received',
  PENDING_RECONCILIATION: 'Pending reconciliation',
  RECONCILIATION_IN_PROGRESS: 'Reconciliation in progress',
  RECONCILIATION_COMPLETED: 'Report completed',
};

export const getReportReconciliationSummaryViewModel = (summaryApiResponse: UtilisationReportReconciliationSummaryItem[]): SummaryItemViewModel[] =>
  summaryApiResponse.map((item) => ({
    ...item,
    displayStatus: reconciliationStatusCodeToDisplayStatus[item.status],
    formattedDateUploaded: item.dateUploaded ? format(parseISO(item.dateUploaded), 'd MMM yyyy') : undefined,
    downloadPath: item.reportId && !item.isPlaceholderReport ? `/utilisation-reports/${item.reportId}/download` : undefined,
  }));
