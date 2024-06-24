import { Currency, CurrencyAndAmountString, SessionBank } from '@ukef/dtfs2-common';
import { PaymentErrorsViewModel } from './payment-form-view-model';
import { EditPaymentFormValues } from '../edit-payment-form-values';
import { FeeRecordDetailsViewModel } from './fee-record-details-view-model';

export type EditPaymentViewModel = {
  reportId: string;
  paymentId: string;
  paymentCurrency: Currency;
  bank: SessionBank;
  formattedReportPeriod: string;
  feeRecords: FeeRecordDetailsViewModel;
  totalReportedPayments: CurrencyAndAmountString;
  errors: PaymentErrorsViewModel;
  formValues: EditPaymentFormValues;
};
