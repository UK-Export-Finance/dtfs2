import { isValid, parseISO } from 'date-fns';
import { IsoDateTimeStamp, getFormattedCurrencyAndAmount, getFormattedReportPeriodWithLongMonth, getOneIndexedMonth } from '@ukef/dtfs2-common';
import { GetEditPaymentDetailsResponseBody, FeeRecord, Payment } from '../../../api-response-types';
import { getKeyToCurrencyAndAmountSortValueMap } from './get-key-to-currency-and-amount-sort-value-map-helper';
import { EditPaymentFormValues } from '../../../types/edit-payment-form-values';
import { PaymentErrorsViewModel, EditPaymentViewModel } from '../../../types/view-models';
import { EMPTY_PAYMENT_ERRORS_VIEW_MODEL } from './payment-form-helpers';

const mapToEditPaymentFeeRecords = (feeRecords: FeeRecord[]): EditPaymentViewModel['feeRecords'] => {
  const reportedFeesDataSortValueMap = getKeyToCurrencyAndAmountSortValueMap(feeRecords.map(({ reportedFees }, index) => ({ ...reportedFees, key: index })));
  const reportedPaymentsDataSortValueMap = getKeyToCurrencyAndAmountSortValueMap(
    feeRecords.map(({ reportedPayments }, index) => ({ ...reportedPayments, key: index })),
  );

  return feeRecords.map((feeRecord, index) => ({
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
    checkboxId: `feeRecordId-${feeRecord.id}`,
    isChecked: false,
  }));
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
 * Maps the edit payment response body to the edit payment view model
 * @param editPaymentResponse - The GET edit payment response body
 * @param reportId - The report id
 * @returns The edit payment view model
 */
export const getEditPaymentViewModel = (editPaymentResponse: GetEditPaymentDetailsResponseBody, reportId: string, paymentId: string): EditPaymentViewModel => ({
  reportId,
  paymentId,
  paymentCurrency: editPaymentResponse.payment.currency,
  bank: editPaymentResponse.bank,
  formattedReportPeriod: getFormattedReportPeriodWithLongMonth(editPaymentResponse.reportPeriod),
  feeRecords: mapToEditPaymentFeeRecords(editPaymentResponse.feeRecords),
  totalReportedPayments: getFormattedCurrencyAndAmount(editPaymentResponse.totalReportedPayments),
  formValues: mapToEditPaymentFormValues(editPaymentResponse.payment),
  errors: EMPTY_PAYMENT_ERRORS_VIEW_MODEL,
});

/**
 * Maps the edit payment response body to the edit payment view model
 * @param editPaymentResponse - The GET edit payment response body
 * @param reportId - The report id
 * @returns The edit payment view model
 */
export const getEditPaymentViewModelWithFormValuesAndErrors = (
  editPaymentResponse: GetEditPaymentDetailsResponseBody,
  reportId: string,
  paymentId: string,
  formValues: EditPaymentFormValues,
  errors: PaymentErrorsViewModel,
): EditPaymentViewModel => ({
  reportId,
  paymentId,
  paymentCurrency: editPaymentResponse.payment.currency,
  bank: editPaymentResponse.bank,
  formattedReportPeriod: getFormattedReportPeriodWithLongMonth(editPaymentResponse.reportPeriod),
  feeRecords: mapToEditPaymentFeeRecords(editPaymentResponse.feeRecords),
  totalReportedPayments: getFormattedCurrencyAndAmount(editPaymentResponse.totalReportedPayments),
  formValues,
  errors,
});
