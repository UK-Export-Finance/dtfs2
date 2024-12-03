import { ReconciliationForReportTab } from '../reconciliation-for-report-tab';

export type ConfirmDeletePaymentViewModel = {
  paymentSummaryListRows: {
    key: { text: string };
    value: { text: string };
  }[];
  redirectTab?: ReconciliationForReportTab;
};
