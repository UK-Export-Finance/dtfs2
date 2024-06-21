import { CurrencyAndAmountString } from '@ukef/dtfs2-common';
import { ErrorSummaryViewModel } from './error-summary-view-model';
import { AddPaymentFormValues } from '../add-payment-form-values';
import { BaseViewModel } from './base-view-model';

type SelectedReportedFeeViewModel = {
  feeRecordId: number;
  facilityId: string;
  exporter: string;
  reportedFee: {
    value: CurrencyAndAmountString;
    dataSortValue: number;
  };
  reportedPayments: {
    value: CurrencyAndAmountString;
    dataSortValue: number;
  };
};

export type SelectedReportedFeesDetailsViewModel = {
  feeRecords: SelectedReportedFeeViewModel[];
  totalReportedPayments: CurrencyAndAmountString;
};

export type RecordedPaymentDetailsViewModel = {
  formattedCurrencyAndAmount: CurrencyAndAmountString;
  formattedDateReceived: string;
  reference?: string;
};

export type AddPaymentPaymentDateErrorViewModel = { message: string; dayError: boolean; monthError: boolean; yearError: boolean };

export type AddPaymentErrorsViewModel = {
  paymentCurrencyErrorMessage?: string;
  paymentAmountErrorMessage?: string;
  paymentDateError?: AddPaymentPaymentDateErrorViewModel;
  paymentReferenceErrorMessage?: string;
  addAnotherPaymentErrorMessage?: string;
  errorSummary: ErrorSummaryViewModel[];
};

export type AddPaymentViewModel = BaseViewModel & {
  reportId: string;
  bank: { name: string };
  formattedReportPeriod: string;
  reportedFeeDetails: SelectedReportedFeesDetailsViewModel;
  recordedPaymentsDetails: RecordedPaymentDetailsViewModel[];
  multipleFeeRecordsSelected: boolean;
  paymentNumber: number;
  selectedFeeRecordCheckboxIds: string[];
  errors: AddPaymentErrorsViewModel;
  formValues: AddPaymentFormValues;
};
