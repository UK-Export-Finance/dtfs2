import {
  Currency,
  CurrencyAndAmountString,
  FeeRecordStatus,
  KeyingSheetAdjustmentChange,
  KeyingSheetRowStatus,
  PaymentDetailsFilters,
  PremiumPaymentsFilters,
  SessionBank,
} from '@ukef/dtfs2-common';
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
  id: number;
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
  feeRecordPaymentGroupStatus: FeeRecordStatus;
  payment: PaymentDetailsPaymentViewModel;
  feeRecords: {
    id: number;
    facilityId: string;
    exporter: string;
  }[];
  reconciledBy: string;
  dateReconciled: {
    formattedDateReconciled: string;
    dataSortValue: number;
  };
}[];

export type PremiumPaymentsViewModelItem = {
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

export type PaymentDetailsFilterErrorsViewModel = {
  facilityIdErrorMessage?: string;
  errorSummary: ErrorSummaryViewModel[];
};

export type UtilisationReportReconciliationForReportViewModel = BaseViewModel & {
  bank: SessionBank;
  formattedReportPeriod: string;
  reportId: string;
  premiumPayments: PremiumPaymentsViewModelItem[];
  premiumPaymentsFilters?: PremiumPaymentsFilters;
  premiumPaymentsFilterError?: ErrorSummaryViewModel;
  premiumPaymentsTableDataError?: ErrorSummaryViewModel;
  enablePaymentsReceivedSorting: boolean;
  keyingSheet: KeyingSheetViewModel;
  paymentDetails: PaymentDetailsViewModel;
  paymentDetailsFilters?: PaymentDetailsFilters;
  paymentDetailsFilterErrors: PaymentDetailsFilterErrorsViewModel;
};
