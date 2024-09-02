import orderBy from 'lodash.orderby';
import { FeeRecordStatus, getFormattedCurrencyAndAmount, IsoDateTimeStamp, KeyingSheetAdjustment } from '@ukef/dtfs2-common';
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
import { getKeyToDateSortValueMap } from './get-key-to-date-sort-value-map-helper';

/**
 * Sort fee records by reported payments
 * @param feeRecords - The fee records to sort
 * @returns Fee records sorted by reported payments
 */
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

/**
 * Gets the data sort value map for the fee record payment group by property
 * @param feeRecordPaymentGroups - The fee record payment groups
 * @param property - The property to sort by
 * @returns The data sort value map
 */
const getDataSortValueMapForFeeRecordPaymentGroupProperty = (
  feeRecordPaymentGroups: FeeRecordPaymentGroup[],
  property: SortableFeeRecordPaymentGroupProperty,
) => {
  const propertyWithIndexAsKey = feeRecordPaymentGroups.map((group, index) => ({ ...group[property], key: index }));
  return getKeyToCurrencyAndAmountSortValueMap(propertyWithIndexAsKey);
};

/**
 * Gets a checkbox id for a list of fee records and status
 * @param feeRecords - The fee records
 * @param status - The status
 * @returns The checkbox id
 */
const getCheckboxIdForFeeRecordsAndStatus = (feeRecords: FeeRecord[], status: FeeRecordStatus): PremiumPaymentsTableCheckboxId => {
  const feeRecordIdList = feeRecords.map(({ id }) => id).join(',');
  const reportedPaymentsCurrency = feeRecords[0].reportedPayments.currency;
  return `feeRecordIds-${feeRecordIdList}-reportedPaymentsCurrency-${reportedPaymentsCurrency}-status-${status}`;
};

/**
 * Gets a checkbox aria label
 * @param feeRecords - The fee records
 * @returns The checkbox aria label
 */
const getCheckboxAriaLabel = (feeRecords: FeeRecord[]): string => {
  const feeRecordFacilityIdList = feeRecords.map(({ facilityId }) => facilityId).join(' ');
  return `Select ${feeRecordFacilityIdList}`;
};

/**
 * Maps the fee record payment groups to the fee record payment group view model items
 * @param feeRecordPaymentGroups - The fee record payment groups
 * @param isCheckboxChecked - Whether or not the fee record payment group checkbox is checked
 * @returns The fee record payment group view model items
 */
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

/**
 * Gets the keying sheet adjustment view model
 * @param adjustment - The keying sheet adjustment
 * @returns The keying sheet adjustment view model
 */
const getKeyingSheetAdjustmentViewModel = (adjustment: KeyingSheetAdjustment | null): KeyingSheetAdjustmentViewModel => {
  if (!adjustment) {
    return { amount: undefined, change: 'NONE' };
  }
  return {
    amount: adjustment.amount.toFixed(2),
    change: adjustment.change,
  };
};

/**
 * Maps the keying sheet fee payments to the keying sheet fee payments view model
 * @param feePayments - The fee payments
 * @returns The fee payments view model
 */
const mapKeyingSheetFeePaymentsToKeyingSheetFeePaymentsViewModel = (feePayments: KeyingSheetRow['feePayments']) =>
  feePayments.map(({ currency, amount, dateReceived }) => ({
    formattedCurrencyAndAmount: getFormattedCurrencyAndAmount({ currency, amount }),
    formattedDateReceived: dateReceived ? format(new Date(dateReceived), 'd MMM yyyy') : undefined,
  }));

/**
 * Gets the keying sheet row checkbox id
 * @param keyingSheetRow - The keying sheet row
 * @returns The checkbox id
 */
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
 * Maps the payment to the payment details payment view model
 * @param paymentReceived - The received payment
 * @param amountDataSortValue - The amount data sort value
 * @param dateReceivedDataSortValue - The date received data sort value
 * @returns The payment details view model payment
 */
const mapPaymentToPaymentDetailsPaymentViewModel = (
  payment: Payment,
  amountDataSortValue: number,
  dateReceivedDataSortValue: number,
): PaymentDetailsPaymentViewModel => ({
  id: payment.id,
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
 * Gets the formatted reconciled by user
 * @param reconciledByUser - The reconciled by user
 * @returns The formatted reconciled by user
 */
export const getFormattedReconciledByUser = (reconciledByUser: { firstName: string; lastName: string } | undefined): string =>
  reconciledByUser ? `${reconciledByUser.firstName} ${reconciledByUser.lastName}` : '-';

/**
 * Formats the date reconciled
 *
 * The "aaaaa'm'" selection is so we can format the date to use
 * lowercase 'AM' or 'PM' and comes from the below link.
 * {@link https://stackoverflow.com/questions/60728212/how-do-you-format-a-datetime-to-am-pm-without-periods-when-using-date-fns-vers}
 * @param dateReconciled - The date reconciled
 * @returns The formatted date
 * @example
 * getFormattedDateReconciled('2024-01-01T12:30:00.000'); // '1 Jan 2024 at 12:30pm'
 * getFormattedDateReconciled('2024-01-01T11:30:00.000'); // '1 Jan 2024 at 11:30am'
 * getFormattedDateReconciled(undefined); // '-'
 */
export const getFormattedDateReconciled = (dateReconciled: IsoDateTimeStamp | undefined): string =>
  dateReconciled ? format(parseISO(dateReconciled), "d MMM yyyy 'at' hh:mmaaaaa'm'") : '-';

/**
 * Maps the fee record payment groups to the payment details view model
 * @param feeRecordPaymentGroups - The fee record payment groups
 * @returns The payment details view model
 */
export const mapFeeRecordPaymentGroupsToPaymentDetailsViewModel = (feeRecordPaymentGroups: FeeRecordPaymentGroup[]): PaymentDetailsViewModel => {
  const allPaymentsWithDateReconciled = feeRecordPaymentGroups.reduce(
    (payments, { paymentsReceived, dateReconciled }) => {
      if (!paymentsReceived) {
        return payments;
      }

      return [...payments, ...paymentsReceived.map((payment) => ({ ...payment, dateReconciled }))];
    },
    [] as (Payment & { dateReconciled?: IsoDateTimeStamp })[],
  );

  const paymentIdToAmountDataSortValueMap = getKeyToCurrencyAndAmountSortValueMap(
    allPaymentsWithDateReconciled.map(({ id, amount, currency }) => ({ key: id, currency, amount })),
  );
  const paymentIdToDateReceivedDataSortValueMap: { [key: number]: number } = getKeyToDateSortValueMap(
    allPaymentsWithDateReconciled.map(({ id, dateReceived }) => ({ key: id, date: dateReceived })),
  );
  const paymentIdToDateReconciledDataSortValueMap = getKeyToDateSortValueMap(
    allPaymentsWithDateReconciled.map(({ id, dateReconciled }) => ({ key: id, date: dateReconciled })),
  );

  return feeRecordPaymentGroups.reduce(
    (paymentDetails, { feeRecords, paymentsReceived, status: feeRecordPaymentGroupStatus, reconciledByUser, dateReconciled }) => {
      if (!paymentsReceived) {
        return paymentDetails;
      }

      const mappedFeeRecords = feeRecords.map(({ facilityId, exporter }) => ({ facilityId, exporter }));
      return [
        ...paymentDetails,
        ...paymentsReceived.map((payment) => ({
          feeRecordPaymentGroupStatus,
          payment: mapPaymentToPaymentDetailsPaymentViewModel(
            payment,
            paymentIdToAmountDataSortValueMap[payment.id],
            paymentIdToDateReceivedDataSortValueMap[payment.id],
          ),
          feeRecords: mappedFeeRecords,
          reconciledBy: getFormattedReconciledByUser(reconciledByUser),
          dateReconciled: {
            formattedDateReconciled: getFormattedDateReconciled(dateReconciled),
            dataSortValue: paymentIdToDateReconciledDataSortValueMap[payment.id],
          },
        })),
      ];
    },
    [] as PaymentDetailsViewModel,
  );
};
