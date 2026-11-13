import { ReconciliationForReportTab } from '@tfm-ui/types/reconciliation-for-report-tab';

export type ConfirmDeletePaymentViewModel = {
  paymentSummaryListRows: {
    key: { text: string };
    value: { text: string };
  }[];
  redirectTab?: ReconciliationForReportTab;
};
