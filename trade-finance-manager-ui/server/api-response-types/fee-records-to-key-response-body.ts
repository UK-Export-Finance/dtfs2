import { CurrencyAndAmount, FeeRecordStatus, ReportPeriod, SessionBank } from '@ukef/dtfs2-common';
import { FeeRecordItem } from './utilisation-report-reconciliation-details-response-body';

export type FeeRecordToKey = FeeRecordItem & {
  paymentsReceived: CurrencyAndAmount[];
  status: FeeRecordStatus;
};

export type FeeRecordsToKeyResponseBody = {
  id: number;
  bank: SessionBank;
  reportPeriod: ReportPeriod;
  feeRecords: FeeRecordToKey[];
};
