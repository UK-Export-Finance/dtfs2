import { CurrencyAndAmountString } from '@ukef/dtfs2-common';
import { BaseViewModel } from './base-view-model';
import { PaymentFormViewModel } from './payment-form-view-model';
import { FeeRecordDetailsViewModel } from './fee-record-details-view-model';

export type SelectedReportedFeesDetailsViewModel = {
  feeRecords: FeeRecordDetailsViewModel;
  totalReportedPayments: CurrencyAndAmountString;
};

export type RecordedPaymentDetailsViewModel = {
  formattedCurrencyAndAmount: CurrencyAndAmountString;
  formattedDateReceived: string;
  reference?: string;
};

export type AddPaymentViewModel = BaseViewModel &
  PaymentFormViewModel & {
    reportId: string;
    bank: { name: string };
    formattedReportPeriod: string;
    reportedFeeDetails: SelectedReportedFeesDetailsViewModel;
    recordedPaymentsDetails: RecordedPaymentDetailsViewModel[];
    multipleFeeRecordsSelected: boolean;
  };
