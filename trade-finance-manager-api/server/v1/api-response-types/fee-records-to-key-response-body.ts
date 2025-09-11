import { CurrencyAndAmount, FeeRecordStatus, ReportPeriod, SessionBank } from '@ukef/dtfs2-common';
import { FeeRecord } from './fee-record';

export type FeeRecordToKey = FeeRecord & {
  paymentsReceived: CurrencyAndAmount[];
  status: FeeRecordStatus;
};

export type FeeRecordsToKeyResponseBody = {
  reportId: number;
  bank: SessionBank;
  reportPeriod: ReportPeriod;
  feeRecords: FeeRecordToKey[];
};
