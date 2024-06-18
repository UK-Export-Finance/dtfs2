import orderBy from 'lodash.orderby';
import { FeeRecordStatus, getFormattedCurrencyAndAmount } from '@ukef/dtfs2-common';
import { FeeRecordItem, FeeRecordPaymentGroup, Payment } from '../../../api-response-types';
import { FeeRecordDisplayStatus, FeeRecordPaymentGroupViewModelItem, FeeRecordViewModelItem, PaymentViewModelItem } from '../../../types/view-models';
import { getKeyToCurrencyAndAmountSortValueMap } from './get-key-to-currency-and-amount-sort-value-map-helper';
import { PremiumPaymentsTableCheckboxId } from '../../../types/premium-payments-table-checkbox-id';

const feeRecordStatusToDisplayStatus: Record<FeeRecordStatus, FeeRecordDisplayStatus> = {
  TO_DO: 'TO DO',
  MATCH: 'MATCH',
  DOES_NOT_MATCH: 'DOES NOT MATCH',
  READY_TO_KEY: 'READY TO KEY',
  RECONCILED: 'RECONCILED',
};

const sortFeeRecordsByReportedPayments = (feeRecords: FeeRecordItem[]): FeeRecordItem[] =>
  orderBy(feeRecords, [({ reportedPayments }) => reportedPayments.currency, ({ reportedPayments }) => reportedPayments.amount], ['asc']);
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
const mapPaymentsToPaymentViewModelItems = (paymentsReceived: Payment[] | null): PaymentViewModelItem[] | undefined => {
  if (!paymentsReceived) {
    return undefined;
  }

  return paymentsReceived.map((payment) => ({
    id: payment.id,
    formattedCurrencyAndAmount: getFormattedCurrencyAndAmount(payment),
  }));
};

type SortableFeeRecordPaymentGroupProperty = 'totalReportedPayments' | 'totalPaymentsReceived';

const getDataSortValueMapForFeeRecordPaymentGroupProperty = (
  feeRecordPaymentGroups: FeeRecordPaymentGroup[],
  property: SortableFeeRecordPaymentGroupProperty,
) => {
  const propertyWithIndexAsKey = feeRecordPaymentGroups.map((group, index) => ({ ...group[property], key: index }));
  return getKeyToCurrencyAndAmountSortValueMap(propertyWithIndexAsKey);
};

const getCheckboxIdForFeeRecordsAndStatus = (feeRecords: FeeRecordItem[], status: FeeRecordStatus): PremiumPaymentsTableCheckboxId => {
  const feeRecordIdList = feeRecords.map(({ id }) => id).join(',');
  const reportedPaymentsCurrency = feeRecords[0].reportedPayments.currency;
  return `feeRecordIds-${feeRecordIdList}-reportedPaymentsCurrency-${reportedPaymentsCurrency}-status-${status}`;
};

export const mapFeeRecordPaymentGroupsToFeeRecordPaymentGroupViewModelItems = (
  feeRecordPaymentGroups: FeeRecordPaymentGroup[],
  isCheckboxChecked: (checkboxId: string) => boolean = () => false,
): FeeRecordPaymentGroupViewModelItem[] => {
  const totalReportedPaymentsDataSortValueMap = getDataSortValueMapForFeeRecordPaymentGroupProperty(feeRecordPaymentGroups, 'totalReportedPayments');
  const totalPaymentsReceivedDataSortValueMap = getDataSortValueMapForFeeRecordPaymentGroupProperty(feeRecordPaymentGroups, 'totalPaymentsReceived');

  return feeRecordPaymentGroups.map((feeRecordPaymentGroup, index) => {
    const { status, feeRecords, paymentsReceived, totalReportedPayments, totalPaymentsReceived } = feeRecordPaymentGroup;

    const displayStatus = feeRecordStatusToDisplayStatus[status];

    const checkboxId = getCheckboxIdForFeeRecordsAndStatus(feeRecords, status);
    const isChecked = isCheckboxChecked(checkboxId);

    const feeRecordsSortedByReportedPayments = sortFeeRecordsByReportedPayments(feeRecords);
    const feeRecordViewModelItems = mapFeeRecordItemsToFeeRecordViewModelItems(feeRecordsSortedByReportedPayments);
    const paymentViewModelItems = mapPaymentsToPaymentViewModelItems(paymentsReceived);

    return {
      feeRecords: feeRecordViewModelItems,
      totalReportedPayments: {
        formattedCurrencyAndAmount: getFormattedCurrencyAndAmount(totalReportedPayments),
        dataSortValue: totalReportedPaymentsDataSortValueMap[index],
      },
      paymentsReceived: paymentViewModelItems,
      totalPaymentsReceived: {
        formattedCurrencyAndAmount: totalPaymentsReceived ? getFormattedCurrencyAndAmount(totalPaymentsReceived) : undefined,
        dataSortValue: totalPaymentsReceivedDataSortValueMap[index],
      },
      status,
      displayStatus,
      checkboxId,
      isChecked,
    };
  });
};
