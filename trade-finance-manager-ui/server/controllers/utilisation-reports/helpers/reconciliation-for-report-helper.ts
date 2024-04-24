import { FeeRecordStatus, CurrencyAndAmountString, getCurrencyAndAmountString, ValuesOf } from '@ukef/dtfs2-common';
import { FeeRecordItem } from '../../../api-response-types';

const feeRecordStatusToDisplayStatus = {
  TO_DO: 'TO DO',
} as const;

export type FeeRecordViewModelItem = {
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
  facilityId: feeRecord.facilityId,
  exporter: feeRecord.exporter,
  reportedFees: getCurrencyAndAmountString(feeRecord.reportedFees),
  reportedPayments: getCurrencyAndAmountString(feeRecord.reportedPayments),
  totalReportedPayments: getCurrencyAndAmountString(feeRecord.totalReportedPayments),
  paymentsReceived: feeRecord.paymentsReceived ? getCurrencyAndAmountString(feeRecord.paymentsReceived) : undefined,
  totalPaymentsReceived: feeRecord.totalPaymentsReceived
    ? getCurrencyAndAmountString(feeRecord.totalPaymentsReceived)
    : undefined,
  status: feeRecord.status,
  displayStatus: feeRecordStatusToDisplayStatus[feeRecord.status],
});
