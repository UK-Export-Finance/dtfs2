import { Currency, CurrencyAndAmountString, SessionBank } from '@ukef/dtfs2-common';
import { PaymentErrorsViewModel } from './payment-errors-view-model';
import { EditPaymentFormValues } from '../edit-payment-form-values';
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
};
