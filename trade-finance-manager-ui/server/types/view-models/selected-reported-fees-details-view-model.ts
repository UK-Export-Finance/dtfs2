import { CurrencyAndAmountString } from '@ukef/dtfs2-common';
import { FeeRecordDetailsWithoutCheckboxesViewModel } from './fee-record-details-view-model';

export type SelectedReportedFeesDetailsViewModel = {
  feeRecords: FeeRecordDetailsWithoutCheckboxesViewModel;
  totalReportedPayments: CurrencyAndAmountString;
};
