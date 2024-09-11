import { ReconciliationForReportTab } from '../../../types/reconciliation-for-report-tab';

/**
 * Gets the reconciliation for report page href
 * @param reportId - The report id
 * @param redirectTab - The specific tab to redirect to on the page
 * @returns The href
 */
export const getReconciliationForReportHref = (reportId: string, redirectTab?: ReconciliationForReportTab): string => {
  const reconciliationForReportUrl = `/utilisation-reports/${reportId}`;

  if (!redirectTab) {
    return reconciliationForReportUrl;
  }

  return `${reconciliationForReportUrl}#${redirectTab}`;
};
