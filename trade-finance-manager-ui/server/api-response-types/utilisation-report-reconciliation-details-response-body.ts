import {
  IsoDateTimeStamp,
  ReportPeriod,
  UtilisationReportReconciliationStatus,
  FeeRecordStatus,
  CurrencyAndAmount,
  KeyingSheetRowStatus,
  Currency,
  KeyingSheetAdjustment,
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

export type KeyingSheetRow = {
  feeRecordId: number;
  status: KeyingSheetRowStatus;
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

export type KeyingSheet = KeyingSheetRow[];

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
