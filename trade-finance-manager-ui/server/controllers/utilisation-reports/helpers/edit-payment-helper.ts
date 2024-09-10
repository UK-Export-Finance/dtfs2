import { isValid, parseISO } from 'date-fns';
import { IsoDateTimeStamp, getFormattedCurrencyAndAmount, getFormattedReportPeriodWithLongMonth, getOneIndexedMonth } from '@ukef/dtfs2-common';
import { GetPaymentDetailsWithFeeRecordsResponseBody, FeeRecord, Payment } from '../../../api-response-types';
import { getKeyToCurrencyAndAmountSortValueMap } from './get-key-to-currency-and-amount-sort-value-map-helper';
import { EditPaymentFormValues } from '../../../types/edit-payment-form-values';
import { EditPaymentViewModel, FeeRecordDetailsCheckboxId, EditPaymentErrorsViewModel } from '../../../types/view-models';
import { EMPTY_PAYMENT_ERRORS_VIEW_MODEL } from './payment-form-helpers';
import { EditPaymentsTableCheckboxId } from '../../../types/edit-payments-table-checkbox-id';
import { ReconciliationForReportTab } from '../../../types/reconciliation-for-report-tab';
import { getReconciliationForReportHref } from './get-reconciliation-for-report-href';

const mapToEditPaymentFeeRecords = (
  feeRecords: FeeRecord[],
  isCheckboxChecked: (checkboxId: EditPaymentsTableCheckboxId) => boolean,
): EditPaymentViewModel['feeRecords'] => {
  const reportedFeesDataSortValueMap = getKeyToCurrencyAndAmountSortValueMap(feeRecords.map(({ reportedFees }, index) => ({ ...reportedFees, key: index })));
  const reportedPaymentsDataSortValueMap = getKeyToCurrencyAndAmountSortValueMap(
    feeRecords.map(({ reportedPayments }, index) => ({ ...reportedPayments, key: index })),
  );

  return feeRecords.map((feeRecord, index) => {
    const checkboxId: FeeRecordDetailsCheckboxId = `feeRecordId-${feeRecord.id}`;

    return {
      id: feeRecord.id,
      facilityId: feeRecord.facilityId,
      exporter: feeRecord.exporter,
      reportedFees: {
        formattedCurrencyAndAmount: getFormattedCurrencyAndAmount(feeRecord.reportedFees),
        dataSortValue: reportedFeesDataSortValueMap[index],
      },
      reportedPayments: {
        formattedCurrencyAndAmount: getFormattedCurrencyAndAmount(feeRecord.reportedPayments),
        dataSortValue: reportedPaymentsDataSortValueMap[index],
      },
      checkboxId,
      isChecked: isCheckboxChecked(checkboxId),
    };
  });
};

const mapToEditPaymentFormPaymentDate = (dateReceived: IsoDateTimeStamp): EditPaymentFormValues['paymentDate'] => {
  const dateReceivedAsDate = parseISO(dateReceived);
  if (!isValid(dateReceivedAsDate)) {
    throw new Error(`Payment date received '${dateReceived}' is not a valid date`);
  }
  return {
    day: dateReceivedAsDate.getUTCDate().toString(),
    month: getOneIndexedMonth(dateReceivedAsDate).toString(),
    year: dateReceivedAsDate.getFullYear().toString(),
  };
};

const mapToEditPaymentFormValues = (payment: Payment): EditPaymentFormValues => ({
  paymentAmount: payment.amount.toString(),
  paymentDate: mapToEditPaymentFormPaymentDate(payment.dateReceived),
  paymentReference: payment.reference,
});

/**
 * Maps the payment details response body to the edit payment view model
 * @param editPaymentResponse - The GET payment details response body
 * @param reportId - The report id
 * @returns The edit payment view model
 */
export const getEditPaymentViewModel = (
  editPaymentResponse: GetPaymentDetailsWithFeeRecordsResponseBody,
  reportId: string,
  paymentId: string,
  isCheckboxChecked: (checkboxId: string) => boolean,
  redirectTab?: ReconciliationForReportTab,
  errors: EditPaymentErrorsViewModel = EMPTY_PAYMENT_ERRORS_VIEW_MODEL,
): EditPaymentViewModel => ({
  reportId,
  paymentId,
  paymentCurrency: editPaymentResponse.payment.currency,
  bank: editPaymentResponse.bank,
  formattedReportPeriod: getFormattedReportPeriodWithLongMonth(editPaymentResponse.reportPeriod),
  feeRecords: mapToEditPaymentFeeRecords(editPaymentResponse.feeRecords, isCheckboxChecked),
  totalReportedPayments: getFormattedCurrencyAndAmount(editPaymentResponse.totalReportedPayments),
  formValues: mapToEditPaymentFormValues(editPaymentResponse.payment),
  errors,
  backLinkHref: getReconciliationForReportHref(reportId, redirectTab),
  redirectTab,
});

/**
 * Maps the payment details response body to the edit payment view model
 * @param editPaymentResponse - The GET payment details response body
 * @param reportId - The report id
 * @returns The edit payment view model
 */
export const getEditPaymentViewModelWithFormValues = (
  editPaymentResponse: GetPaymentDetailsWithFeeRecordsResponseBody,
  reportId: string,
  paymentId: string,
  isCheckboxChecked: (checkboxId: EditPaymentsTableCheckboxId) => boolean,
  formValues: EditPaymentFormValues,
  redirectTab?: ReconciliationForReportTab,
  errors: EditPaymentErrorsViewModel = EMPTY_PAYMENT_ERRORS_VIEW_MODEL,
): EditPaymentViewModel => ({
  reportId,
  paymentId,
  paymentCurrency: editPaymentResponse.payment.currency,
  bank: editPaymentResponse.bank,
  formattedReportPeriod: getFormattedReportPeriodWithLongMonth(editPaymentResponse.reportPeriod),
  feeRecords: mapToEditPaymentFeeRecords(editPaymentResponse.feeRecords, isCheckboxChecked),
  totalReportedPayments: getFormattedCurrencyAndAmount(editPaymentResponse.totalReportedPayments),
  formValues,
  errors,
  backLinkHref: getReconciliationForReportHref(reportId, redirectTab),
  redirectTab,
});
