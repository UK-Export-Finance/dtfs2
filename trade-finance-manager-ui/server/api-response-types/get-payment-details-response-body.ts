import { CurrencyAndAmount, ReportPeriod, SessionBank } from '@ukef/dtfs2-common';
import { FeeRecord } from './fee-record';
import { Payment } from './payment';

export type GetPaymentDetailsWithFeeRecordsResponseBody = {
  bank: SessionBank;
  reportPeriod: ReportPeriod;
  payment: Payment;
  feeRecords: FeeRecord[];
  totalReportedPayments: CurrencyAndAmount;
};

export type GetPaymentDetailsWithoutFeeRecordsResponseBody = {
  bank: SessionBank;
  reportPeriod: ReportPeriod;
  payment: Payment;
};
