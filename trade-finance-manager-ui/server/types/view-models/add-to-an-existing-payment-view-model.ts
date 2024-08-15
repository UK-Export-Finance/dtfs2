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

export type AvailablePaymentViewModelItem = {
  id: string;
  formattedCurrencyAndAmount: CurrencyAndAmountString;
  reference?: string;
};

export type AvailablePaymentGroupViewModel = {
  radioId: AddToAnExistingPaymentRadioId;
  payments: AvailablePaymentViewModelItem[];
};

export type AvailablePaymentGroupsViewModel = AvailablePaymentGroupViewModel[];

export type AddToAnExistingPaymentViewModel = BaseViewModel & {
  reportId: string;
  bank: { name: string };
  formattedReportPeriod: string;
  reportedFeeDetails: SelectedReportedFeesDetailsViewModel;
  selectedFeeRecordCheckboxIds: PremiumPaymentsTableCheckboxId[];
  availablePaymentsHeading: string;
  availablePaymentGroups: AvailablePaymentGroupsViewModel;
  errors: AddToAnExistingPaymentErrorsViewModel;
};
