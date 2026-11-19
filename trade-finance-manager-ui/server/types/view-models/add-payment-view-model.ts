import { CurrencyAndAmountString } from '@ukef/dtfs2-common';
import { AddPaymentFormValues } from '@tfm-ui/types/add-payment-form-values';
import { PremiumPaymentsTableCheckboxId } from '@tfm-ui/types/premium-payments-table-checkbox-id';
import { BaseViewModel } from './base-view-model';
import { PaymentErrorsViewModel } from './payment-errors-view-model';
import { SelectedReportedFeesDetailsViewModel } from './selected-reported-fees-details-view-model';

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
  selectedFeeRecordCheckboxIds: PremiumPaymentsTableCheckboxId[];
  formValues: AddPaymentFormValues;
  errors: PaymentErrorsViewModel;
  multipleFeeRecordsSelected: boolean;
  canAddToExistingPayment: boolean;
  backLinkHref: string;
  gbpTolerance: number;
};
