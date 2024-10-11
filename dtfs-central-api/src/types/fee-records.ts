import { Currency, CurrencyAndAmount, FeeRecordStatus, KeyingSheetAdjustment, KeyingSheetRowStatus } from '@ukef/dtfs2-common';

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

export type KeyingSheetFeePayment = {
  dateReceived: Date | null;
  currency: Currency;
  amount: number;
};

export type KeyingSheetRow = {
  feeRecordId: number;
  status: KeyingSheetRowStatus;
  facilityId: string;
  exporter: string;
  feePayments: KeyingSheetFeePayment[];
  baseCurrency: Currency;
  fixedFeeAdjustment: KeyingSheetAdjustment | null;
  principalBalanceAdjustment: KeyingSheetAdjustment | null;
};

export type KeyingSheet = KeyingSheetRow[];
