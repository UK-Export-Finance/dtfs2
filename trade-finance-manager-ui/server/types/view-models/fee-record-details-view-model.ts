import { SortedAndFormattedCurrencyAndAmount } from './utilisation-report-reconciliation-for-report-view-model';

export type FeeRecordDetailsCheckboxId = `feeRecordId-${number}`;

type BaseFeeRecordDetailsViewModel = {
  id: number;
  facilityId: string;
  exporter: string;
  reportedFees: SortedAndFormattedCurrencyAndAmount;
  reportedPayments: SortedAndFormattedCurrencyAndAmount;
};

export type FeeRecordDetailsWithCheckboxesViewModel = (BaseFeeRecordDetailsViewModel & {
  checkboxId?: FeeRecordDetailsCheckboxId;
  isChecked?: boolean;
})[];

export type FeeRecordDetailsWithoutCheckboxesViewModel = BaseFeeRecordDetailsViewModel[];
