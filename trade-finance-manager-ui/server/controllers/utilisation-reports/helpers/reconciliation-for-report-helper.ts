import { FeeRecordStatus, getFormattedCurrencyAndAmount } from '@ukef/dtfs2-common';
import { FeeRecordItem } from '../../../api-response-types';
import { FeeRecordDisplayStatus, FeeRecordViewModelItem } from '../../../types/view-models';
import { getFeeRecordItemIndexToDataSortValueMap } from './get-fee-record-item-index-to-data-sort-value-map-helper';

const feeRecordStatusToDisplayStatus: Record<FeeRecordStatus, FeeRecordDisplayStatus> = {
  TO_DO: 'TO DO',
  MATCH: 'MATCH',
  DOES_NOT_MATCH: 'DOES NOT MATCH',
  READY_TO_KEY: 'READY TO KEY',
  RECONCILED: 'RECONCILED',
};

type SortableFeeRecordItemProperties = 'reportedFees' | 'reportedPayments' | 'totalReportedPayments' | 'paymentsReceived' | 'totalPaymentsReceived';

/**
 * Maps the fee record items to only the supplied property
 * with the fee record index
 * @param feeRecordItems - The fee record items
 * @param property - The property to extract
 * @returns The property with the fee record index
 */
const getPropertyWithFeeRecordIndex = (feeRecordItems: FeeRecordItem[], property: SortableFeeRecordItemProperties) =>
  feeRecordItems.map((feeRecordItem, feeRecordIndex) => ({ ...feeRecordItem[property], feeRecordIndex }));

/**
 * Maps the fee record items to the fee record view model items
 * @param feeRecordItems - The fee record items
 * @returns The fee record view model items
 */
export const mapFeeRecordItemsToFeeRecordViewModelItems = (feeRecordItems: FeeRecordItem[]): FeeRecordViewModelItem[] => {
  const reportedFeesDataSortValueMap = getFeeRecordItemIndexToDataSortValueMap(getPropertyWithFeeRecordIndex(feeRecordItems, 'reportedFees'));
  const reportedPaymentsDataSortValueMap = getFeeRecordItemIndexToDataSortValueMap(getPropertyWithFeeRecordIndex(feeRecordItems, 'reportedPayments'));
  const totalReportedPaymentsDataSortValueMap = getFeeRecordItemIndexToDataSortValueMap(getPropertyWithFeeRecordIndex(feeRecordItems, 'totalReportedPayments'));
  const paymentsReceivedDataSortValueMap = getFeeRecordItemIndexToDataSortValueMap(getPropertyWithFeeRecordIndex(feeRecordItems, 'paymentsReceived'));
  const totalPaymentsReceivedDataSortValueMap = getFeeRecordItemIndexToDataSortValueMap(getPropertyWithFeeRecordIndex(feeRecordItems, 'totalPaymentsReceived'));

  return feeRecordItems.map((feeRecordItem, feeRecordIndex) => ({
    id: feeRecordItem.id,
    facilityId: feeRecordItem.facilityId,
    exporter: feeRecordItem.exporter,
    reportedFees: {
      formattedCurrencyAndAmount: getFormattedCurrencyAndAmount(feeRecordItem.reportedFees),
      dataSortValue: reportedFeesDataSortValueMap[feeRecordIndex],
    },
    reportedPayments: {
      formattedCurrencyAndAmount: getFormattedCurrencyAndAmount(feeRecordItem.reportedPayments),
      dataSortValue: reportedPaymentsDataSortValueMap[feeRecordIndex],
    },
    totalReportedPayments: {
      formattedCurrencyAndAmount: getFormattedCurrencyAndAmount(feeRecordItem.totalReportedPayments),
      dataSortValue: totalReportedPaymentsDataSortValueMap[feeRecordIndex],
    },
    paymentsReceived: {
      formattedCurrencyAndAmount: feeRecordItem.paymentsReceived ? getFormattedCurrencyAndAmount(feeRecordItem.paymentsReceived) : undefined,
      dataSortValue: paymentsReceivedDataSortValueMap[feeRecordIndex],
    },
    totalPaymentsReceived: {
      formattedCurrencyAndAmount: feeRecordItem.totalPaymentsReceived ? getFormattedCurrencyAndAmount(feeRecordItem.totalPaymentsReceived) : undefined,
      dataSortValue: totalPaymentsReceivedDataSortValueMap[feeRecordIndex],
    },
    status: feeRecordItem.status,
    displayStatus: feeRecordStatusToDisplayStatus[feeRecordItem.status],
  }));
};
