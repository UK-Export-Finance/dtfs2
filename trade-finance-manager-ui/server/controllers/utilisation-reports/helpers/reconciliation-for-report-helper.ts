import orderBy from 'lodash.orderby';
import {
  FEE_RECORD_STATUS,
  FeeRecordStatus,
  getFormattedCurrencyAndAmount,
  getFormattedMonetaryValue,
  IsoDateTimeStamp,
  KeyingSheetAdjustment,
  PaymentDetailsFilters,
} from '@ukef/dtfs2-common';
import { format, parseISO } from 'date-fns';
import { FeeRecord, KeyingSheet, KeyingSheetRow, Payment, PaymentDetails, PremiumPaymentsGroup } from '../../../api-response-types';
import {
  PremiumPaymentsViewModelItem,
  FeeRecordViewModelItem,
  KeyingSheetAdjustmentViewModel,
  KeyingSheetViewModel,
  PaymentDetailsPaymentViewModel,
  PaymentViewModelItem,
  PaymentDetailsRowViewModel,
  PaymentDetailsFiltersViewModel,
} from '../../../types/view-models';
import { DATE_FORMAT } from '../../../constants';
import { getKeyToCurrencyAndAmountSortValueMap } from './get-key-to-currency-and-amount-sort-value-map-helper';
import { PremiumPaymentsTableCheckboxId } from '../../../types/premium-payments-table-checkbox-id';
import { getFeeRecordDisplayStatus } from './get-fee-record-display-status';
import { getKeyingSheetDisplayStatus } from './get-keying-sheet-display-status';
import { KeyingSheetCheckboxId } from '../../../types/keying-sheet-checkbox-id';
import { getKeyToDateSortValueMap } from './get-key-to-date-sort-value-map-helper';
import { mapCurrenciesToRadioItems } from '../../../helpers/map-currencies-to-radio-items';

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

type SortablePremiumPaymentsGroupProperty = 'totalReportedPayments' | 'totalPaymentsReceived';

/**
 * Gets the data sort value map for the premium payments groups by property
 * @param premiumPaymentGroups - The premium payments groups
 * @param property - The property to sort by
 * @returns The data sort value map
 */
const getDataSortValueMapForPremiumPaymentsGroupProperty = (premiumPaymentGroups: PremiumPaymentsGroup[], property: SortablePremiumPaymentsGroupProperty) => {
  const propertyWithIndexAsKey = premiumPaymentGroups.map((group, index) => ({ ...group[property], key: index }));
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
 * Maps the premium payments groups to the premium payment items
 * @param premiumPaymentGroups - The premium payments groups
 * @param isCheckboxChecked - Whether or not the premium payments group checkbox is checked
 * @returns The premium payments view model items
 */
export const mapPremiumPaymentsToViewModelItems = (
  premiumPaymentGroups: PremiumPaymentsGroup[],
  isCheckboxChecked: (feeRecordIds: number[]) => boolean = () => false,
): PremiumPaymentsViewModelItem[] => {
  const totalReportedPaymentsDataSortValueMap = getDataSortValueMapForPremiumPaymentsGroupProperty(premiumPaymentGroups, 'totalReportedPayments');
  const totalPaymentsReceivedDataSortValueMap = getDataSortValueMapForPremiumPaymentsGroupProperty(premiumPaymentGroups, 'totalPaymentsReceived');

  return premiumPaymentGroups.map((premiumPaymentGroup, index) => {
    const { status, feeRecords, paymentsReceived, totalReportedPayments, totalPaymentsReceived } = premiumPaymentGroup;

    const displayStatus = getFeeRecordDisplayStatus(status);

    const checkboxId = getCheckboxIdForFeeRecordsAndStatus(feeRecords, status);
    const isChecked = isCheckboxChecked(feeRecords.map(({ id }) => id));
    const checkboxAriaLabel = getCheckboxAriaLabel(feeRecords);

    const feeRecordsSortedByReportedPayments = sortFeeRecordsByReportedPayments(feeRecords);
    const feeRecordViewModelItems = mapFeeRecordsToFeeRecordViewModelItems(feeRecordsSortedByReportedPayments);
    const paymentViewModelItems = mapPaymentsToPaymentViewModelItems(paymentsReceived);

    const isSelectable = status === FEE_RECORD_STATUS.TO_DO || status === FEE_RECORD_STATUS.DOES_NOT_MATCH;

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
      isSelectable,
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
    amount: getFormattedMonetaryValue(adjustment.amount),
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
    formattedDateReceived: dateReceived ? format(new Date(dateReceived), DATE_FORMAT.DAY_SHORT_MONTH_YEAR) : undefined,
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
    formattedDateReceived: format(new Date(payment.dateReceived), DATE_FORMAT.DAY_SHORT_MONTH_YEAR),
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
 * @param dateReconciled - The date reconciled
 * @returns The formatted date
 * @example
 * getFormattedDateReconciled('2024-01-01T12:30:00.000'); // '1 Jan 2024 at 12:30pm'
 * getFormattedDateReconciled('2024-01-01T11:30:00.000'); // '1 Jan 2024 at 11:30am'
 * getFormattedDateReconciled(undefined); // '-'
 */
export const getFormattedDateReconciled = (dateReconciled: IsoDateTimeStamp | undefined): string =>
  dateReconciled ? format(parseISO(dateReconciled), DATE_FORMAT.DAY_SHORT_MONTH_YEAR_AT_TIME) : '-';

/**
 * Maps the payment details groups to the payment details view model
 * @param paymentDetailsGroups - The payment details groups
 * @returns The payment details view model
 */
export const mapPaymentDetailsGroupsToPaymentDetailsViewModel = (paymentDetailsGroups: PaymentDetails[]): PaymentDetailsRowViewModel[] => {
  // Flatten the groups to a list of payments with the date reconciled of the group existing on
  // the payment which can be used to determine the sort orders for the columns with custom sorting
  const allPaymentsWithDateReconciled = paymentDetailsGroups.reduce(
    (payments, { payment, dateReconciled }) => {
      if (!payment) {
        return payments;
      }

      return [...payments, { ...payment, dateReconciled }];
    },
    [] as (Payment & { dateReconciled?: IsoDateTimeStamp })[],
  );

  // Construct sort value maps for the columns that have custom sorting that the table component cannot
  // infer just from column values
  // Construct sort value map for the payment amounts
  const paymentIdToAmountDataSortValueMap = getKeyToCurrencyAndAmountSortValueMap(
    allPaymentsWithDateReconciled.map(({ id, amount, currency }) => ({ key: id, currency, amount })),
  );
  // Construct sort value map for the date the payments were received
  const paymentIdToDateReceivedDataSortValueMap: { [key: number]: number } = getKeyToDateSortValueMap(
    allPaymentsWithDateReconciled.map(({ id, dateReceived }) => ({ key: id, date: dateReceived })),
  );
  // Construct sort value map for the date the payments were reconciled
  const paymentIdToDateReconciledDataSortValueMap = getKeyToDateSortValueMap(
    allPaymentsWithDateReconciled.map(({ id, dateReconciled }) => ({ key: id, date: dateReconciled })),
  );

  // Construct and return payment details view models for each payment in each group
  return paymentDetailsGroups.reduce((paymentDetails, { feeRecords, payment, status, reconciledByUser, dateReconciled }) => {
    if (!payment) {
      return paymentDetails;
    }

    const mappedFeeRecords = feeRecords.map(({ id, facilityId, exporter }) => ({ id, facilityId, exporter }));
    return [
      ...paymentDetails,
      {
        payment: mapPaymentToPaymentDetailsPaymentViewModel(
          payment,
          paymentIdToAmountDataSortValueMap[payment.id],
          paymentIdToDateReceivedDataSortValueMap[payment.id],
        ),
        feeRecords: mappedFeeRecords,
        status,
        reconciledBy: getFormattedReconciledByUser(reconciledByUser),
        dateReconciled: {
          formattedDateReconciled: getFormattedDateReconciled(dateReconciled),
          dataSortValue: paymentIdToDateReconciledDataSortValueMap[payment.id],
        },
      },
    ];
  }, [] as PaymentDetailsRowViewModel[]);
};

/**
 * Maps payment details filters to a view model for payment details filters.
 * The supported currencies are mapped to radio items.
 * If a currency filter is defined, the corresponding radio item for that
 * currency is checked.
 * @param paymentDetailsFilters - The payment details filters to be mapped.
 * @returns A view model of the payment details filters with the supported
 * payment currencies mapped to radio items.
 */
export const mapPaymentDetailsFiltersToViewModel = (paymentDetailsFilters: PaymentDetailsFilters): PaymentDetailsFiltersViewModel => {
  return {
    ...paymentDetailsFilters,
    paymentCurrency: mapCurrenciesToRadioItems(paymentDetailsFilters.paymentCurrency),
  };
};

/**
 * Determines whether the premium payments select all checkbox should be displayed
 * @param items - the items that will be displayed in the table
 * @returns - whether premium payments select all checkbox should be displayed
 */
export const shouldDisplayPremiumPaymentsSelectAllCheckbox = (items: PremiumPaymentsViewModelItem[]): boolean => items.some((item) => item.isSelectable);
