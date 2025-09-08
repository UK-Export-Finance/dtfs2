import { CurrencyAndAmount, ReportPeriod, SessionBank } from '@ukef/dtfs2-common';
import { FeeRecord } from './fee-record';
import { Payment } from './payment';

export type PaymentDetailsResponseBody = {
  bank: SessionBank;
  reportPeriod: ReportPeriod;
  payment: Payment;
} & (
  | {
      feeRecords: FeeRecord[];
      totalReportedPayments: CurrencyAndAmount;
    }
  | {
      feeRecords?: undefined;
      totalReportedPayments?: undefined;
    }
);
