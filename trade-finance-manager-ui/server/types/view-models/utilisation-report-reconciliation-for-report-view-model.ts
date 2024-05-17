import { CurrencyAndAmountString, FeeRecordStatus, SessionBank } from '@ukef/dtfs2-common';
import { PrimaryNavigationKey } from '../primary-navigation-key';
import { TfmSessionUser } from '../tfm-session-user';

export type SortedAndFormattedCurrencyAndAmount = {
  formattedCurrencyAndAmount: CurrencyAndAmountString | undefined;
  dataSortValue: number;
};

export type FeeRecordDisplayStatus = 'TO DO' | 'MATCH' | 'DOES NOT MATCH' | 'READY TO KEY' | 'RECONCILED';

export type FeeRecordViewModelItem = {
  id: number;
  facilityId: string;
  exporter: string;
  reportedFees: SortedAndFormattedCurrencyAndAmount;
  reportedPayments: SortedAndFormattedCurrencyAndAmount;
  totalReportedPayments: SortedAndFormattedCurrencyAndAmount;
  paymentsReceived: SortedAndFormattedCurrencyAndAmount;
  totalPaymentsReceived: SortedAndFormattedCurrencyAndAmount;
  status: FeeRecordStatus;
  displayStatus: FeeRecordDisplayStatus;
};

export type UtilisationReportReconciliationForReportViewModel = {
  user: TfmSessionUser;
  activePrimaryNavigation: PrimaryNavigationKey;
  bank: SessionBank;
  formattedReportPeriod: string;
  feeRecords: FeeRecordViewModelItem[];
};
