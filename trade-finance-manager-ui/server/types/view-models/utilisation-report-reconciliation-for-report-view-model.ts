import {
  Currency,
  CurrencyAndAmountString,
  FeeRecordStatus,
  KeyingSheetAdjustmentChange,
  KeyingSheetRowStatus,
  PaymentDetailsFilters,
  PremiumPaymentsFilters,
  RadioItem,
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
  reference?: string;
  dateReceived: {
    formattedDateReceived: string;
    dataSortValue: number;
  };
};

export type PremiumPaymentsViewModelItem = {
  feeRecords: FeeRecordViewModelItem[];
  totalReportedPayments: SortedAndFormattedCurrencyAndAmount;
  paymentsReceived: PaymentViewModelItem[] | undefined;
  totalPaymentsReceived: SortedAndFormattedCurrencyAndAmount;
  status: FeeRecordStatus;
  displayStatus: FeeRecordDisplayStatus;
  isSelectable: boolean;
  checkboxId: PremiumPaymentsTableCheckboxId;
  isChecked: boolean;
  checkboxAriaLabel: string;
};

export type PaymentDetailsFiltersViewModel = Omit<PaymentDetailsFilters, 'paymentCurrency'> & {
  paymentCurrency: RadioItem[];
};

export type PaymentDetailsFilterErrorsViewModel = {
  errorSummary: ErrorSummaryViewModel[];
  facilityIdErrorMessage?: string;
  paymentCurrencyErrorMessage?: string;
  paymentReferenceErrorMessage?: string;
};

export type PaymentDetailsRowViewModel = {
  payment: PaymentDetailsPaymentViewModel;
  feeRecords: {
    id: number;
    facilityId: string;
    exporter: string;
  }[];
  status: FeeRecordStatus;
  reconciledBy: string;
  dateReconciled: {
    formattedDateReconciled: string;
    dataSortValue: number;
  };
};

export type SelectedFilter = { value: string; removeHref: string };

export type SelectedPaymentDetailsFiltersViewModel = {
  facilityId?: SelectedFilter;
  paymentCurrency?: SelectedFilter;
  paymentReference?: SelectedFilter;
};

export type PaymentDetailsViewModel = {
  rows: PaymentDetailsRowViewModel[];
  filters?: PaymentDetailsFiltersViewModel;
  selectedFilters: SelectedPaymentDetailsFiltersViewModel | null;
  filterErrors?: PaymentDetailsFilterErrorsViewModel;
  isFilterActive?: boolean;
};

export type UtilisationTableRowViewModel = {
  feeRecordId: number;
  facilityId: string;
  exporter: string;
  baseCurrency: Currency;
  formattedValue: string;
  formattedUtilisation: string;
  coverPercentage: number;
  formattedExposure: string;
  feesAccrued: {
    formattedCurrencyAndAmount: CurrencyAndAmountString;
    dataSortValue: number;
  };
  feesPayable: {
    formattedCurrencyAndAmount: CurrencyAndAmountString;
    dataSortValue: number;
  };
};

export type UtilisationDetailsViewModel = {
  utilisationTableRows: UtilisationTableRowViewModel[];
  downloadUrl: string;
};

export type PremiumPaymentsViewModel = {
  payments: PremiumPaymentsViewModelItem[];
  filters?: PremiumPaymentsFilters;
  filterError?: ErrorSummaryViewModel;
  tableDataError?: ErrorSummaryViewModel;
  enablePaymentsReceivedSorting: boolean;
  displayMatchSuccessNotification: boolean;
  displaySelectAllCheckbox: boolean;
};

export type UtilisationReportReconciliationForReportViewModel = BaseViewModel & {
  bank: SessionBank;
  formattedReportPeriod: string;
  reportId: string;
  premiumPayments: PremiumPaymentsViewModel;
  keyingSheet: KeyingSheetViewModel;
  paymentDetails: PaymentDetailsViewModel;
  utilisationDetails: UtilisationDetailsViewModel;
};
