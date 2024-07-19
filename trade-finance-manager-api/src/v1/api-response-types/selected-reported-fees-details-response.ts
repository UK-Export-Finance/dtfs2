import { CurrencyAndAmount, IsoDateTimeStamp, ReportPeriod, SelectedFeeRecordDetails } from '@ukef/dtfs2-common';

type SelectedFeeRecordsPaymentDetailsResponse = CurrencyAndAmount & {
  dateReceived: IsoDateTimeStamp;
  reference?: string;
};

export type SelectedFeeRecordsDetailsResponseBody = {
  totalReportedPayments: CurrencyAndAmount;
  bank: {
    name: string;
  };
  reportPeriod: ReportPeriod;
  feeRecords: SelectedFeeRecordDetails[];
  payments: SelectedFeeRecordsPaymentDetailsResponse[];
  canAddToExistingPayment: boolean;
};
