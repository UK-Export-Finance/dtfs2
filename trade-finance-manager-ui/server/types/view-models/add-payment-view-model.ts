import { CurrencyAndAmountString } from '@ukef/dtfs2-common';

export type SelectedReportedFeeViewModel = {
  feeRecordId: number;
  facilityId: string;
  exporter: string;
  reportedFee: CurrencyAndAmountString;
  reportedPayment: CurrencyAndAmountString;
};

export type SelectedReportedFeesDetailsViewModel = {
  feeRecords: SelectedReportedFeeViewModel[];
  totalReportedPayments: CurrencyAndAmountString;
};

export type AddPaymentViewModel = {
  bank: { name: string };
  reportPeriod: string;
  reportedFeeDetails: SelectedReportedFeesDetailsViewModel;
};
