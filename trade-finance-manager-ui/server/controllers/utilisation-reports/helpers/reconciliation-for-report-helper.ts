import orderBy from 'lodash.orderby';
import { FeeRecordStatus, getFormattedCurrencyAndAmount } from '@ukef/dtfs2-common';
import { FeeRecord, FeeRecordPaymentGroup, Payment } from '../../../api-response-types';
import { FeeRecordPaymentGroupViewModelItem, FeeRecordViewModelItem, PaymentViewModelItem } from '../../../types/view-models';
import { getKeyToCurrencyAndAmountSortValueMap } from './get-key-to-currency-and-amount-sort-value-map-helper';
import { PremiumPaymentsTableCheckboxId } from '../../../types/premium-payments-table-checkbox-id';
import { getFeeRecordDisplayStatus } from './get-fee-record-display-status';

const sortFeeRecordsByReportedPayments = (feeRecords: FeeRecord[]): FeeRecord[] =>
  orderBy(feeRecords, [({ reportedPayments }) => reportedPayments.currency, ({ reportedPayments }) => reportedPayments.amount], ['asc']);
/**
 * Maps the fee records to the fee record view model items
 * @param feeRecords - The fee record items
 * @returns The fee record view model items
 */
const mapFeeRecordsToFeeRecordViewModelItems = (feeRecords: FeeRecord[]): FeeRecordViewModelItem[] =>
  feeRecords.map((feeRecord) => {
    return {
      id: feeRecord.id,
      facilityId: feeRecord.facilityId,
      exporter: feeRecord.exporter,
      reportedFees: getFormattedCurrencyAndAmount(feeRecord.reportedFees),
      reportedPayments: getFormattedCurrencyAndAmount(feeRecord.reportedPayments),
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

const getCheckboxIdForFeeRecordsAndStatus = (feeRecords: FeeRecord[], status: FeeRecordStatus): PremiumPaymentsTableCheckboxId => {
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

    const displayStatus = getFeeRecordDisplayStatus(status);

    const checkboxId = getCheckboxIdForFeeRecordsAndStatus(feeRecords, status);
    const isChecked = isCheckboxChecked(checkboxId);

    const feeRecordsSortedByReportedPayments = sortFeeRecordsByReportedPayments(feeRecords);
    const feeRecordViewModelItems = mapFeeRecordsToFeeRecordViewModelItems(feeRecordsSortedByReportedPayments);
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
