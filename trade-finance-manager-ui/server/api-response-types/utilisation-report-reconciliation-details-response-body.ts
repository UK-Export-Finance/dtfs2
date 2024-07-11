import {
  IsoDateTimeStamp,
  ReportPeriod,
  UtilisationReportReconciliationStatus,
  FeeRecordStatus,
  CurrencyAndAmount,
  KeyingSheetStatus,
  Currency,
} from '@ukef/dtfs2-common';
import { FeeRecord } from './fee-record';
import { Payment } from './payment';

export type FeeRecordPaymentGroup = {
  feeRecords: FeeRecord[];
  totalReportedPayments: CurrencyAndAmount;
  paymentsReceived: Payment[] | null;
  totalPaymentsReceived: CurrencyAndAmount | null;
  status: FeeRecordStatus;
};

export type KeyingSheetAdjustment = {
  change: 'INCREASE' | 'DECREASE' | 'NONE';
  amount: number;
};

export type KeyingSheetItem = {
  feeRecordId: number;
  status: KeyingSheetStatus;
  facilityId: string;
  exporter: string;
  feePayments: {
    currency: Currency;
    amount: number;
    dateReceived: IsoDateTimeStamp;
  }[];
  baseCurrency: Currency;
  fixedFeeAdjustment: KeyingSheetAdjustment | null;
  premiumAccrualBalanceAdjustment: KeyingSheetAdjustment | null;
  principalBalanceAdjustment: KeyingSheetAdjustment | null;
};

export type KeyingSheet = KeyingSheetItem[];

export type UtilisationReportReconciliationDetailsResponseBody = {
  reportId: number;
  bank: {
    id: string;
    name: string;
  };
  status: UtilisationReportReconciliationStatus;
  reportPeriod: ReportPeriod;
  dateUploaded: IsoDateTimeStamp;
  feeRecordPaymentGroups: FeeRecordPaymentGroup[];
  keyingSheet: KeyingSheet;
};
