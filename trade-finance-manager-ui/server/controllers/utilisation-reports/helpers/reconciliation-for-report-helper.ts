import { FeeRecordStatus, CurrencyAndAmountString, getFormattedCurrencyAndAmount, ValuesOf } from '@ukef/dtfs2-common';
import { FeeRecordItem } from '../../../api-response-types';

const feeRecordStatusToDisplayStatus = {
  TO_DO: 'TO DO',
  MATCH: 'MATCH',
  DOES_NOT_MATCH: 'DOES NOT MATCH',
  READY_TO_KEY: 'READY TO KEY',
  RECONCILED: 'RECONCILED',
  REPORT_COMPLETED: 'REPORT COMPLETED',
} as const;

export type FeeRecordViewModelItem = {
  id: number;
  facilityId: string;
  exporter: string;
  reportedFees: CurrencyAndAmountString;
  reportedPayments: CurrencyAndAmountString;
  totalReportedPayments: CurrencyAndAmountString;
  paymentsReceived: CurrencyAndAmountString | undefined;
  totalPaymentsReceived: CurrencyAndAmountString | undefined;
  status: FeeRecordStatus;
  displayStatus: ValuesOf<typeof feeRecordStatusToDisplayStatus>;
};

export const mapFeeRecordItemToFeeRecordViewModelItem = (feeRecord: FeeRecordItem): FeeRecordViewModelItem => ({
  id: feeRecord.id,
  facilityId: feeRecord.facilityId,
  exporter: feeRecord.exporter,
  reportedFees: getFormattedCurrencyAndAmount(feeRecord.reportedFees),
  reportedPayments: getFormattedCurrencyAndAmount(feeRecord.reportedPayments),
  totalReportedPayments: getFormattedCurrencyAndAmount(feeRecord.totalReportedPayments),
  paymentsReceived: feeRecord.paymentsReceived ? getFormattedCurrencyAndAmount(feeRecord.paymentsReceived) : undefined,
  totalPaymentsReceived: feeRecord.totalPaymentsReceived ? getFormattedCurrencyAndAmount(feeRecord.totalPaymentsReceived) : undefined,
  status: feeRecord.status,
  displayStatus: feeRecordStatusToDisplayStatus[feeRecord.status],
});
