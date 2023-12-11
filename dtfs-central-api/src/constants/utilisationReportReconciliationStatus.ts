import { UtilisationReportReconciliationStatus } from '../types/utilisation-reports';

export const UTILISATION_REPORT_RECONCILIATION_STATUS: Record<UtilisationReportReconciliationStatus, UtilisationReportReconciliationStatus> = {
  REPORT_NOT_RECEIVED: 'REPORT_NOT_RECEIVED',
  PENDING_RECONCILIATION: 'PENDING_RECONCILIATION',
  RECONCILIATION_IN_PROGRESS: 'RECONCILIATION_IN_PROGRESS',
  RECONCILIATION_COMPLETED: 'RECONCILIATION_COMPLETED',
};
