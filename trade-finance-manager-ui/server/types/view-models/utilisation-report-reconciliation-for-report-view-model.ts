import { CurrencyAndAmountString, FeeRecordStatus, SessionBank } from '@ukef/dtfs2-common';
import { ErrorSummaryViewModel } from './error-summary-view-model';
import { PremiumPaymentsTableCheckboxId } from '../premium-payments-table-checkbox-id';
import { BaseViewModel } from './base-view-model';

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
  premiumPaymentFormError: ErrorSummaryViewModel | undefined;
  facilityIdQueryError: ErrorSummaryViewModel | undefined;
  facilityIdQuery?: string;
};
