import { CurrencyAndAmountString } from '@ukef/dtfs2-common';
import { ErrorSummaryViewModel } from './error-summary-view-model';
import { AddPaymentFormValues } from '../add-payment-form-values';
import { BaseViewModel } from './base-view-model';

export type SelectedReportedFeeViewModel = {
  feeRecordId: number;
  facilityId: string;
  exporter: string;
  reportedFee: CurrencyAndAmountString;
  reportedPayments: CurrencyAndAmountString;
};

export type SelectedReportedFeesDetailsViewModel = {
  feeRecords: SelectedReportedFeeViewModel[];
  totalReportedPayments: CurrencyAndAmountString;
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
  reportId: number;
  bank: { name: string };
  formattedReportPeriod: string;
  reportedFeeDetails: SelectedReportedFeesDetailsViewModel;
  paymentNumber: number | undefined;
  selectedFeeRecordCheckboxIds: string[];
  errors: AddPaymentErrorsViewModel;
  formValues: AddPaymentFormValues;
};
