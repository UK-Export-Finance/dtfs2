import { Prettify, SessionBank } from '@ukef/dtfs2-common';
import { FeeRecordPaymentGroupViewModelItem } from './utilisation-report-reconciliation-for-report-view-model';

export type CheckKeyingDataFeeRecordPaymentGroupViewModelItem = Prettify<
  Omit<FeeRecordPaymentGroupViewModelItem, 'totalReportedPayments' | 'totalPaymentsReceived' | 'checkboxId' | 'isChecked'>
>;

export type CheckKeyingDataViewModel = {
  reportId: string;
  bank: SessionBank;
  formattedReportPeriod: string;
  feeRecordPaymentGroups: CheckKeyingDataFeeRecordPaymentGroupViewModelItem[];
  numberOfMatchingFacilities: number;
};
