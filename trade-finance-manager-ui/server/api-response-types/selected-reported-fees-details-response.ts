import { CurrencyAndAmount, IsoDateTimeStamp, ReportPeriod, SelectedFeeRecordDetails, SelectedFeeRecordsAvailablePaymentGroups } from '@ukef/dtfs2-common';

export type SelectedFeeRecordsPaymentDetailsResponse = CurrencyAndAmount & {
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
  availablePaymentGroups?: SelectedFeeRecordsAvailablePaymentGroups;
};
