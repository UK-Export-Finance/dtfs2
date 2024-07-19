import { CurrencyAndAmount } from './currency';
import { ReportPeriod } from './utilisation-reports';

export type SelectedFeeRecordsPaymentDetails = CurrencyAndAmount & {
  dateReceived: Date;
  reference?: string;
};

export type SelectedFeeRecordDetails = {
  id: number;
  facilityId: string;
  exporter: string;
  reportedFee: CurrencyAndAmount;
  reportedPayments: CurrencyAndAmount;
};

export type SelectedFeeRecordsDetails = {
  totalReportedPayments: CurrencyAndAmount;
  bank: {
    name: string;
  };
  reportPeriod: ReportPeriod;
  feeRecords: SelectedFeeRecordDetails[];
  payments: SelectedFeeRecordsPaymentDetails[];
  canAddToExistingPayment: boolean;
};
