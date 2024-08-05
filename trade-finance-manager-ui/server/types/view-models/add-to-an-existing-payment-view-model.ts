import { CurrencyAndAmountString } from '@ukef/dtfs2-common';
import { SelectedReportedFeesDetailsViewModel } from './selected-reported-fees-details-view-model';
import { BaseViewModel } from './base-view-model';
import { AddToAnExistingPaymentRadioId } from '../add-to-an-existing-payment-radio-id';

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
  availablePaymentsHeading: string;
  availablePaymentGroups: AvailablePaymentGroupsViewModel;
};
