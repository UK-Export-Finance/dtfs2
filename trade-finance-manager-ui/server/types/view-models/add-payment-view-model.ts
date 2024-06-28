import { CurrencyAndAmountString } from '@ukef/dtfs2-common';
import { BaseViewModel } from './base-view-model';
import { PaymentErrorsViewModel } from './payment-errors-view-model';
import { FeeRecordDetailsWithoutCheckboxesViewModel } from './fee-record-details-view-model';
import { AddPaymentFormValues } from '../add-payment-form-values';

export type SelectedReportedFeesDetailsViewModel = {
  feeRecords: FeeRecordDetailsWithoutCheckboxesViewModel;
  totalReportedPayments: CurrencyAndAmountString;
};

export type RecordedPaymentDetailsViewModel = {
  formattedCurrencyAndAmount: CurrencyAndAmountString;
  formattedDateReceived: string;
  reference?: string;
};

export type AddPaymentViewModel = BaseViewModel & {
  reportId: string;
  bank: { name: string };
  formattedReportPeriod: string;
  reportedFeeDetails: SelectedReportedFeesDetailsViewModel;
  recordedPaymentsDetails: RecordedPaymentDetailsViewModel[];
  paymentNumber: number;
  selectedFeeRecordCheckboxIds: string[];
  formValues: AddPaymentFormValues;
  errors: PaymentErrorsViewModel;
  multipleFeeRecordsSelected: boolean;
};
