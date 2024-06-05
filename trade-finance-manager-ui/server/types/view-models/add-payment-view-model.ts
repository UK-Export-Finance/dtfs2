import { CurrencyAndAmountString } from '@ukef/dtfs2-common';

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

export type AddPaymentViewModel = {
  bank: { name: string };
  formattedReportPeriod: string;
  reportedFeeDetails: SelectedReportedFeesDetailsViewModel;
};
