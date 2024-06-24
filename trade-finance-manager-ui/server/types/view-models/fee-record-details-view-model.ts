import { SortedAndFormattedCurrencyAndAmount } from './utilisation-report-reconciliation-for-report-view-model';

export type FeeRecordDetailsCheckboxId = `feeRecordId-${number}`;

export type FeeRecordDetailsViewModel = {
  id: number;
  facilityId: string;
  exporter: string;
  reportedFees: SortedAndFormattedCurrencyAndAmount;
  reportedPayments: SortedAndFormattedCurrencyAndAmount;
  checkboxId?: FeeRecordDetailsCheckboxId;
  isChecked?: boolean;
}[];
