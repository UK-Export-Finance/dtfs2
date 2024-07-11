import { Currency, CurrencyAndAmount, FeeRecordStatus, KeyingSheetStatus } from '@ukef/dtfs2-common';

export type FeeRecord = {
  /**
   * The fee record id
   */
  id: number;
  /**
   * The facility id
   */
  facilityId: string;
  /**
   * The exporter
   */
  exporter: string;
  /**
   * The fees paid to UKEF for the period in the actual payment currency
   */
  reportedFees: CurrencyAndAmount;
  /**
   * The fees paid to UKEF converted to the payment currency
   */
  reportedPayments: CurrencyAndAmount;
};

export type FeeRecordToKey = FeeRecord & {
  paymentsReceived: CurrencyAndAmount[];
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
    dateReceived: Date;
    currency: Currency;
    amount: number;
  }[];
  baseCurrency: Currency;
  fixedFeeAdjustment: KeyingSheetAdjustment | null;
  premiumAccrualBalanceAdjustment: KeyingSheetAdjustment | null;
  principalBalanceAdjustment: KeyingSheetAdjustment | null;
};

export type KeyingSheet = KeyingSheetItem[];
