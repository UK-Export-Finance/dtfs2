import { CurrencyAndAmount, CurrencyAndAmountString, FeeRecordStatus, getFormattedCurrencyAndAmount } from '@ukef/dtfs2-common';
import { FeeRecordItem, FeeRecordPaymentGroupItem } from '../../../api-response-types';
import {
  FeeRecordDisplayStatus,
  FeeRecordPaymentGroupViewModelItem,
  FeeRecordViewModelItem,
  SortedAndFormattedCurrencyAndAmount,
} from '../../../types/view-models';
import { getKeyToCurrencyAndAmountSortValueMap } from './get-key-to-currency-and-amount-sort-value-map-helper';
import { PremiumPaymentsTableCheckboxId } from '../../../types/premium-payments-table-checkbox-id';

const feeRecordStatusToDisplayStatus: Record<FeeRecordStatus, FeeRecordDisplayStatus> = {
  TO_DO: 'TO DO',
  MATCH: 'MATCH',
  DOES_NOT_MATCH: 'DOES NOT MATCH',
  READY_TO_KEY: 'READY TO KEY',
  RECONCILED: 'RECONCILED',
};

/**
 * Maps the fee record items to the fee record view model items
 * @param feeRecordItems - The fee record items
 * @returns The fee record view model items
 */
const mapFeeRecordItemsToFeeRecordViewModelItems = (feeRecordItems: FeeRecordItem[]): FeeRecordViewModelItem[] =>
  feeRecordItems.map((feeRecordItem) => {
    return {
      id: feeRecordItem.id,
      facilityId: feeRecordItem.facilityId,
      exporter: feeRecordItem.exporter,
      reportedFees: getFormattedCurrencyAndAmount(feeRecordItem.reportedFees),
      reportedPayments: getFormattedCurrencyAndAmount(feeRecordItem.reportedPayments),
    };
  });

/**
 * Maps the received payments list to the payment view model items
 * @param paymentsReceived - The list of received payments
 * @returns The payment view model items
 */
const mapPaymentItemsToPaymentViewModelItems = (paymentsReceived: CurrencyAndAmount[] | null): CurrencyAndAmountString[] | undefined => {
  if (!paymentsReceived) {
    return undefined;
  }

  return paymentsReceived.map(getFormattedCurrencyAndAmount);
};

const mapFeeRecordPaymentGroupItemsToTotalReportedPayments = (feeRecordPaymentGroups: FeeRecordPaymentGroupItem[]): SortedAndFormattedCurrencyAndAmount[] => {
  const totalReportedPaymentsWithIndexAsKey = feeRecordPaymentGroups.map(({ totalReportedPayments }, index) => ({ ...totalReportedPayments, key: index }));
  const totalReportedPaymentsDataSortValueMap = getKeyToCurrencyAndAmountSortValueMap(totalReportedPaymentsWithIndexAsKey);

  return feeRecordPaymentGroups.map(({ totalReportedPayments }, index) => ({
    formattedCurrencyAndAmount: getFormattedCurrencyAndAmount(totalReportedPayments),
    dataSortValue: totalReportedPaymentsDataSortValueMap[index],
  }));
};

const mapFeeRecordPaymentGroupItemsToTotalPaymentsReceived = (feeRecordPaymentGroups: FeeRecordPaymentGroupItem[]): SortedAndFormattedCurrencyAndAmount[] => {
  const totalPaymentsReceivedWithIndexAsKey = feeRecordPaymentGroups.map(({ totalPaymentsReceived }, index) => ({ ...totalPaymentsReceived, key: index }));
  const totalPaymentsReceivedDataSortValueMap = getKeyToCurrencyAndAmountSortValueMap(totalPaymentsReceivedWithIndexAsKey);

  return feeRecordPaymentGroups.map(({ totalPaymentsReceived }, index) => ({
    formattedCurrencyAndAmount: totalPaymentsReceived ? getFormattedCurrencyAndAmount(totalPaymentsReceived) : undefined,
    dataSortValue: totalPaymentsReceivedDataSortValueMap[index],
  }));
};

const mapFeeRecordItemsToCheckboxId = (feeRecords: FeeRecordItem[], status: FeeRecordStatus): PremiumPaymentsTableCheckboxId => {
  const feeRecordIdList = feeRecords.map(({ id }) => id).join(',');
  const reportedPaymentsCurrency = feeRecords[0].reportedPayments.currency;
  return `feeRecordIds-${feeRecordIdList}-reportedPaymentsCurrency-${reportedPaymentsCurrency}-status-${status}`;
};

export const mapFeeRecordPaymentGroupsToFeeRecordPaymentGroupViewModelItems = (
  feeRecordPaymentGroups: FeeRecordPaymentGroupItem[],
  isCheckboxChecked: (checkboxId: string) => boolean,
): FeeRecordPaymentGroupViewModelItem[] => {
  const totalReportedPayments = mapFeeRecordPaymentGroupItemsToTotalReportedPayments(feeRecordPaymentGroups);
  const totalPaymentsReceived = mapFeeRecordPaymentGroupItemsToTotalPaymentsReceived(feeRecordPaymentGroups);

  return feeRecordPaymentGroups.map((feeRecordPaymentGroup, index) => {
    const { status, feeRecords, paymentsReceived } = feeRecordPaymentGroup;

    const displayStatus = feeRecordStatusToDisplayStatus[status];

    const checkboxId = mapFeeRecordItemsToCheckboxId(feeRecords, status);
    const isChecked = isCheckboxChecked(checkboxId);

    const feeRecordViewModelItems = mapFeeRecordItemsToFeeRecordViewModelItems(feeRecords);
    const paymentViewModelItems = mapPaymentItemsToPaymentViewModelItems(paymentsReceived);

    return {
      feeRecords: feeRecordViewModelItems,
      totalReportedPayments: totalReportedPayments[index],
      paymentsReceived: paymentViewModelItems,
      totalPaymentsReceived: totalPaymentsReceived[index],
      status,
      displayStatus,
      checkboxId,
      isChecked,
    };
  });
};
