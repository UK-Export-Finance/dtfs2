import orderBy from 'lodash/orderBy';
import { FeeRecordStatus, getFormattedCurrencyAndAmount } from '@ukef/dtfs2-common';
import { FeeRecordItem } from '../../../api-response-types';
import { FeeRecordDisplayStatus, FeeRecordViewModelItem } from '../../../types/view-models';

const feeRecordStatusToDisplayStatus: Record<FeeRecordStatus, FeeRecordDisplayStatus> = {
  TO_DO: 'TO DO',
  MATCH: 'MATCH',
  DOES_NOT_MATCH: 'DOES NOT MATCH',
  READY_TO_KEY: 'READY TO KEY',
  RECONCILED: 'RECONCILED',
};

type SortableFeeRecordItemProperties = 'reportedFees' | 'reportedPayments' | 'totalReportedPayments' | 'paymentsReceived' | 'totalPaymentsReceived';

/**
 * Get the fee record item index to data sort value map
 *
 * This function generates a map to get the data sort value from the
 * fee record item index by a specific property. The data sort value
 * is then passed to the premium payments table and is used to
 * manage the sorting. Without this, the table would use alphabetical
 * sorting on formatted currency and amount strings which would
 * produce unexpected results
 * @param feeRecordItems - The fee record items
 * @param property - The fee record item property to sort by
 * @returns The fee record index to data sort value map
 */
const getFeeRecordItemIndexToDataSortValueMap = (feeRecordItems: FeeRecordItem[], property: SortableFeeRecordItemProperties): { [key: number]: number } => {
  const unsortedProperties = feeRecordItems.map((feeRecordItem, feeRecordIndex) => {
    const currencyAndAmountOrNull = feeRecordItem[property];
    return { ...currencyAndAmountOrNull, feeRecordIndex };
  });

  const sortedProperties = orderBy(unsortedProperties, [({ currency }) => currency ?? '', ({ amount }) => amount ?? 0], ['asc']);
  return sortedProperties.reduce(
    (propertyMap, sortedProperty, dataSortValue) => ({
      ...propertyMap,
      [sortedProperty.feeRecordIndex]: dataSortValue,
    }),
    {},
  );
};

/**
 * Maps the fee record items to the fee record view model items
 * @param feeRecordItems - The fee record items
 * @returns The fee record view model items
 */
export const mapFeeRecordItemsToFeeRecordViewModelItems = (feeRecordItems: FeeRecordItem[]): FeeRecordViewModelItem[] => {
  const reportedFeesDataSortValueMap = getFeeRecordItemIndexToDataSortValueMap(feeRecordItems, 'reportedFees');
  const reportedPaymentsDataSortValueMap = getFeeRecordItemIndexToDataSortValueMap(feeRecordItems, 'reportedPayments');
  const totalReportedPaymentsDataSortValueMap = getFeeRecordItemIndexToDataSortValueMap(feeRecordItems, 'totalReportedPayments');
  const paymentsReceivedDataSortValueMap = getFeeRecordItemIndexToDataSortValueMap(feeRecordItems, 'paymentsReceived');
  const totalPaymentsReceivedDataSortValueMap = getFeeRecordItemIndexToDataSortValueMap(feeRecordItems, 'totalPaymentsReceived');

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
