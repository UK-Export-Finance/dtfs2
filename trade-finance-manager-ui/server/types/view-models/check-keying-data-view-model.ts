import { CurrencyAndAmountString, FeeRecordStatus, SessionBank } from '@ukef/dtfs2-common';
import { FeeRecordDisplayStatus, SortedAndFormattedCurrencyAndAmount } from './utilisation-report-reconciliation-for-report-view-model';

export type FeeRecordToKeyViewModelItem = {
  id: number;
  facilityId: string;
  exporter: string;
  reportedFees: SortedAndFormattedCurrencyAndAmount;
  reportedPayments: SortedAndFormattedCurrencyAndAmount;
  paymentsReceived: CurrencyAndAmountString[];
  status: FeeRecordStatus;
  displayStatus: FeeRecordDisplayStatus;
};

export type CheckKeyingDataViewModel = {
  reportId: string;
  bank: SessionBank;
  formattedReportPeriod: string;
  feeRecords: FeeRecordToKeyViewModelItem[];
  numberOfMatchingFacilities: number;
};
