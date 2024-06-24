import { CurrencyAndAmount, ReportPeriod, SessionBank } from '@ukef/dtfs2-common';
import { FeeRecord } from './fee-records';

export type Payment = CurrencyAndAmount & {
  id: number;
  dateReceived: Date;
  reference?: string;
};

export type EditPaymentDetails = {
  bank: SessionBank;
  reportPeriod: ReportPeriod;
  payment: Payment;
  feeRecords: FeeRecord[];
  totalReportedPayments: CurrencyAndAmount;
};
