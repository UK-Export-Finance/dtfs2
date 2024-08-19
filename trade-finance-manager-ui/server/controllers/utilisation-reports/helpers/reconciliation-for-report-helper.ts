import orderBy from 'lodash.orderby';
import { FeeRecordStatus, getFormattedCurrencyAndAmount, KeyingSheetAdjustment } from '@ukef/dtfs2-common';
import { format, parseISO } from 'date-fns';
import { FeeRecord, FeeRecordPaymentGroup, KeyingSheet, KeyingSheetRow, Payment } from '../../../api-response-types';
import {
  FeeRecordPaymentGroupViewModelItem,
  FeeRecordViewModelItem,
  KeyingSheetAdjustmentViewModel,
  KeyingSheetViewModel,
  PaymentDetailsPaymentViewModel,
  PaymentDetailsViewModel,
  PaymentViewModelItem,
} from '../../../types/view-models';
import { getKeyToCurrencyAndAmountSortValueMap } from './get-key-to-currency-and-amount-sort-value-map-helper';
import { PremiumPaymentsTableCheckboxId } from '../../../types/premium-payments-table-checkbox-id';
import { getFeeRecordDisplayStatus } from './get-fee-record-display-status';
import { getKeyingSheetDisplayStatus } from './get-keying-sheet-display-status';
import { KeyingSheetCheckboxId } from '../../../types/keying-sheet-checkbox-id';

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

const getCheckboxAriaLabel = (feeRecords: FeeRecord[]): string => {
  const feeRecordFacilityIdList = feeRecords.map(({ facilityId }) => facilityId).join(' ');
  return `Select ${feeRecordFacilityIdList}`;
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
    const checkboxAriaLabel = getCheckboxAriaLabel(feeRecords);

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
      checkboxAriaLabel,
    };
  });
};

const getKeyingSheetAdjustmentViewModel = (adjustment: KeyingSheetAdjustment | null): KeyingSheetAdjustmentViewModel => {
  if (!adjustment) {
    return { amount: undefined, change: 'NONE' };
  }
  return {
    amount: adjustment.amount.toFixed(2),
    change: adjustment.change,
  };
};

const mapKeyingSheetFeePaymentsToKeyingSheetFeePaymentsViewModel = (feePayments: KeyingSheetRow['feePayments']) =>
  feePayments.map(({ currency, amount, dateReceived }) => ({
    formattedCurrencyAndAmount: getFormattedCurrencyAndAmount({ currency, amount }),
    formattedDateReceived: dateReceived ? format(new Date(dateReceived), 'd MMM yyyy') : undefined,
  }));

const getKeyingSheetRowCheckboxId = (keyingSheetRow: KeyingSheetRow): KeyingSheetCheckboxId =>
  `feeRecordId-${keyingSheetRow.feeRecordId}-status-${keyingSheetRow.status}`;

/**
 * Maps the keying sheet to the keying sheet view model
 * @param keyingSheet - The keying sheet
 * @returns The keying sheet view model
 */
export const mapKeyingSheetToKeyingSheetViewModel = (keyingSheet: KeyingSheet): KeyingSheetViewModel =>
  keyingSheet.map((keyingSheetRow) => ({
    status: keyingSheetRow.status,
    displayStatus: getKeyingSheetDisplayStatus(keyingSheetRow.status),
    feeRecordId: keyingSheetRow.feeRecordId,
    facilityId: keyingSheetRow.facilityId,
    exporter: keyingSheetRow.exporter,
    baseCurrency: keyingSheetRow.baseCurrency,
    feePayments: mapKeyingSheetFeePaymentsToKeyingSheetFeePaymentsViewModel(keyingSheetRow.feePayments),
    fixedFeeAdjustment: getKeyingSheetAdjustmentViewModel(keyingSheetRow.fixedFeeAdjustment),
    principalBalanceAdjustment: getKeyingSheetAdjustmentViewModel(keyingSheetRow.principalBalanceAdjustment),
    checkboxId: getKeyingSheetRowCheckboxId(keyingSheetRow),
    isChecked: false,
  }));

/**
 * Maps the payment to the payment details view model payment
 * @param paymentReceived - The received
 * @param amountDataSortValue - The amount data sort value
 * @param dateReceivedDataSortValue - The date received data sort value
 * @returns The payment details view model payment
 */
const mapPaymentToPaymentDetailsViewModelPayment = (
  payment: Payment,
  amountDataSortValue: number,
  dateReceivedDataSortValue: number,
): PaymentDetailsPaymentViewModel => ({
  amount: {
    formattedCurrencyAndAmount: getFormattedCurrencyAndAmount(payment),
    dataSortValue: amountDataSortValue,
  },
  reference: payment.reference,
  dateReceived: {
    formattedDateReceived: format(new Date(payment.dateReceived), 'd MMM yyyy'),
    dataSortValue: dateReceivedDataSortValue,
  },
});

/**
 * Returns the payments sorted by date received
 * @param payments - The payments to sort
 * @returns Sorted payments
 */
const getPaymentsSortedByDateReceived = (payments: Payment[]): Payment[] => orderBy(payments, [({ dateReceived }) => parseISO(dateReceived).getTime()], ['asc']);

/**
 * Maps the fee record payment groups to the payment details view model
 * @param feeRecordPaymentGroups - The fee record payment groups
 * @returns The payment details view model
 */
export const mapFeeRecordPaymentGroupsToPaymentDetailsViewModel = (feeRecordPaymentGroups: FeeRecordPaymentGroup[]): PaymentDetailsViewModel => {
  const allPayments = feeRecordPaymentGroups.reduce((payments, { paymentsReceived }) => [...payments, ...(paymentsReceived ?? [])], [] as Payment[]);
  const paymentIdToAmountDataSortValueMap = getKeyToCurrencyAndAmountSortValueMap(
    allPayments.map(({ id, amount, currency }) => ({ key: id, currency, amount })),
  );
  const paymentIdToDateReceivedDataSortValueMap: { [key: number]: number } = getPaymentsSortedByDateReceived(allPayments).reduce(
    (map, { id }, index) => ({ ...map, [id]: index }),
    {},
  );

  return feeRecordPaymentGroups.reduce((paymentDetails, { feeRecords, paymentsReceived }) => {
    if (!paymentsReceived) {
      return paymentDetails;
    }

    const mappedFeeRecords = feeRecords.map(({ facilityId, exporter }) => ({ facilityId, exporter }));
    return [
      ...paymentDetails,
      ...paymentsReceived.map((payment) => ({
        payment: mapPaymentToPaymentDetailsViewModelPayment(
          payment,
          paymentIdToAmountDataSortValueMap[payment.id],
          paymentIdToDateReceivedDataSortValueMap[payment.id],
        ),
        feeRecords: mappedFeeRecords,
      })),
    ];
  }, [] as PaymentDetailsViewModel);
};
