import { CurrencyAndAmountString } from '@ukef/dtfs2-common';
import { SelectedReportedFeesDetailsViewModel } from './selected-reported-fees-details-view-model';
import { BaseViewModel } from './base-view-model';
import { AddToAnExistingPaymentRadioId } from '../add-to-an-existing-payment-radio-id';
import { PremiumPaymentsTableCheckboxId } from '../premium-payments-table-checkbox-id';
import { ErrorSummaryViewModel } from './error-summary-view-model';

export type AddToAnExistingPaymentErrorsViewModel = {
  errorSummary: ErrorSummaryViewModel[];
  paymentGroupErrorMessage?: string;
};

export type PaymentInputViewModelItem = {
  id: string;
  formattedCurrencyAndAmount: CurrencyAndAmountString;
  reference?: string;
};

export type PaymentGroupInputViewModel = {
  radioId: AddToAnExistingPaymentRadioId;
  payments: PaymentInputViewModelItem[];
};

export type PaymentGroupInputsViewModel = PaymentGroupInputViewModel[];

export type AddToAnExistingPaymentViewModel = BaseViewModel & {
  reportId: string;
  bank: { name: string };
  formattedReportPeriod: string;
  reportedFeeDetails: SelectedReportedFeesDetailsViewModel;
  backLinkHref: string;
  selectedFeeRecordCheckboxIds: PremiumPaymentsTableCheckboxId[];
  paymentsHeading: string;
  paymentGroups: PaymentGroupInputsViewModel;
  errors: AddToAnExistingPaymentErrorsViewModel;
};
