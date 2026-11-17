import { Currency, CurrencyAndAmountString, SessionBank } from '@ukef/dtfs2-common';
import { EditPaymentFormValues } from '@tfm-ui/types/edit-payment-form-values';
import { ReconciliationForReportTab } from '@tfm-ui/types/reconciliation-for-report-tab';
import { PaymentErrorsViewModel } from './payment-errors-view-model';
import { FeeRecordDetailsWithCheckboxesViewModel } from './fee-record-details-view-model';

export type EditPaymentErrorsViewModel = PaymentErrorsViewModel & {
  removeSelectedFeesErrorMessage?: string;
};

export type EditPaymentViewModel = {
  reportId: string;
  paymentId: string;
  paymentCurrency: Currency;
  bank: SessionBank;
  formattedReportPeriod: string;
  feeRecords: FeeRecordDetailsWithCheckboxesViewModel;
  totalReportedPayments: CurrencyAndAmountString;
  errors: EditPaymentErrorsViewModel;
  formValues: EditPaymentFormValues;
  backLinkHref: string;
  redirectTab?: ReconciliationForReportTab;
};
