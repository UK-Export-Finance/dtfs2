import { AddPaymentFormValues } from '../add-payment-form-values';
import { EditPaymentFormValues } from '../edit-payment-form-values';
import { ErrorSummaryViewModel } from './error-summary-view-model';

export type PaymentDateErrorViewModel = { message: string; dayError: boolean; monthError: boolean; yearError: boolean };

export type PaymentErrorsViewModel = {
  paymentCurrencyErrorMessage?: string;
  paymentAmountErrorMessage?: string;
  paymentDateError?: PaymentDateErrorViewModel;
  paymentReferenceErrorMessage?: string;
  addAnotherPaymentErrorMessage?: string;
  errorSummary: ErrorSummaryViewModel[];
};

export type PaymentFormViewModel = {
  paymentNumber: number;
  selectedFeeRecordCheckboxIds: string[];
  errors: PaymentErrorsViewModel;
  formValues: AddPaymentFormValues | EditPaymentFormValues;
};
