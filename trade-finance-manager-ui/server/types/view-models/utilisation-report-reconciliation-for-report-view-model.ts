import { Currency, CurrencyAndAmountString, FeeRecordStatus, KeyingSheetAdjustmentChange, KeyingSheetRowStatus, SessionBank } from '@ukef/dtfs2-common';
import { ErrorSummaryViewModel } from './error-summary-view-model';
import { PremiumPaymentsTableCheckboxId } from '../premium-payments-table-checkbox-id';
import { BaseViewModel } from './base-view-model';
import { KeyingSheetCheckboxId } from '../keying-sheet-checkbox-id';

export type SortedAndFormattedCurrencyAndAmount = {
  formattedCurrencyAndAmount: CurrencyAndAmountString | undefined;
  dataSortValue: number;
};

export type FeeRecordDisplayStatus = 'TO DO' | 'MATCH' | 'DOES NOT MATCH' | 'READY TO KEY' | 'RECONCILED';

export type FeeRecordViewModelItem = {
  id: number;
  facilityId: string;
  exporter: string;
  reportedFees: CurrencyAndAmountString;
  reportedPayments: CurrencyAndAmountString;
};

export type PaymentViewModelItem = {
  id: number;
  formattedCurrencyAndAmount: CurrencyAndAmountString;
};

export type KeyingSheetDisplayStatus = 'TO DO' | 'DONE';

export type KeyingSheetAdjustmentViewModel = {
  amount: string | undefined;
  change: KeyingSheetAdjustmentChange;
};

export type KeyingSheetViewModel = {
  feeRecordId: number;
  status: KeyingSheetRowStatus;
  displayStatus: KeyingSheetDisplayStatus;
  facilityId: string;
  exporter: string;
  baseCurrency: Currency;
  feePayments: {
    formattedCurrencyAndAmount: CurrencyAndAmountString;
    formattedDateReceived: string | undefined;
  }[];
  fixedFeeAdjustment: KeyingSheetAdjustmentViewModel;
  principalBalanceAdjustment: KeyingSheetAdjustmentViewModel;
  checkboxId: KeyingSheetCheckboxId;
  isChecked: boolean;
}[];

export type PaymentDetailsPaymentViewModel = {
  amount: {
    formattedCurrencyAndAmount: CurrencyAndAmountString;
    dataSortValue: number;
  };
  reference: string | undefined;
  dateReceived: {
    formattedDateReceived: string;
    dataSortValue: number;
  };
};

export type PaymentDetailsViewModel = {
  payment: PaymentDetailsPaymentViewModel;
  feeRecords: {
    facilityId: string;
    exporter: string;
  }[];
  reconciledBy?: string;
  dateReconciled?: string;
}[];

export type FeeRecordPaymentGroupViewModelItem = {
  feeRecords: FeeRecordViewModelItem[];
  totalReportedPayments: SortedAndFormattedCurrencyAndAmount;
  paymentsReceived: PaymentViewModelItem[] | undefined;
  totalPaymentsReceived: SortedAndFormattedCurrencyAndAmount;
  status: FeeRecordStatus;
  displayStatus: FeeRecordDisplayStatus;
  checkboxId: PremiumPaymentsTableCheckboxId;
  isChecked: boolean;
  checkboxAriaLabel: string;
};

export type UtilisationReportReconciliationForReportViewModel = BaseViewModel & {
  bank: SessionBank;
  formattedReportPeriod: string;
  reportId: string;
  enablePaymentsReceivedSorting: boolean;
  feeRecordPaymentGroups: FeeRecordPaymentGroupViewModelItem[];
  tableDataError: ErrorSummaryViewModel | undefined;
  filterError: ErrorSummaryViewModel | undefined;
  facilityIdQuery?: string;
  keyingSheet: KeyingSheetViewModel;
  paymentDetails: PaymentDetailsViewModel;
};
