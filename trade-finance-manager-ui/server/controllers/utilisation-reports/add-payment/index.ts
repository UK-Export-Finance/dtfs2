import { Response } from 'express';
import { Currency, getFormattedCurrencyAndAmount, getFormattedReportPeriodWithLongMonth } from '@ukef/dtfs2-common';
import { format, parseISO } from 'date-fns';
import {
  AddPaymentErrorsViewModel,
  AddPaymentViewModel,
  RecordedPaymentDetailsViewModel,
  SelectedReportedFeesDetailsViewModel,
} from '../../../types/view-models';
import api from '../../../api';
import { asUserSession } from '../../../helpers/express-session';
import {
  getFeeRecordIdsFromPremiumPaymentsCheckboxIds,
  getFeeRecordPaymentCurrencyFromPremiumPaymentsCheckboxId,
  getPremiumPaymentsCheckboxIdsFromObjectKeys,
} from '../../../helpers/premium-payments-table-checkbox-id-helper';
import { CustomExpressRequest } from '../../../types/custom-express-request';
import { PremiumPaymentsTableCheckboxId } from '../../../types/premium-payments-table-checkbox-id';
import { validateAddPaymentRequestFormValues } from './add-payment-form-values-validator';
import { AddPaymentFormValues, ValidatedAddPaymentFormValues } from '../../../types/add-payment-form-values';
import { PRIMARY_NAVIGATION_KEYS } from '../../../constants';
import { getKeyToCurrencyAndAmountSortValueMap } from '../helpers';
import { SelectedFeeRecordsDetailsResponseBody, SelectedFeeRecordsPaymentDetailsResponse } from '../../../api-response-types';
import { parseValidatedAddPaymentFormValues } from './parse-validated-add-payment-form-values';

export type AddPaymentRequestBody = Record<PremiumPaymentsTableCheckboxId, 'on'> & {
  paymentCurrency?: string;
  paymentAmount?: string;
  'paymentDate-day'?: string;
  'paymentDate-month'?: string;
  'paymentDate-year'?: string;
  paymentReference?: string;
  addAnotherPayment?: string;
  addPaymentFormSubmission?: string;
};

export type AddPaymentRequest = CustomExpressRequest<{
  reqBody: AddPaymentRequestBody;
}>;

const EMPTY_ADD_PAYMENT_ERRORS: AddPaymentErrorsViewModel = { errorSummary: [] };
const EMPTY_ADD_PAYMENT_FORM_VALUES: AddPaymentFormValues = { paymentDate: {} };

const extractFormValuesFromRequestBody = (requestBody: AddPaymentRequestBody): AddPaymentFormValues => ({
  paymentCurrency: requestBody.paymentCurrency,
  paymentAmount: requestBody.paymentAmount,
  paymentDate: {
    day: requestBody['paymentDate-day'],
    month: requestBody['paymentDate-month'],
    year: requestBody['paymentDate-year'],
  },
  paymentReference: requestBody.paymentReference,
  addAnotherPayment: requestBody.addAnotherPayment,
});

const renderAddPaymentPage = (res: Response, context: AddPaymentViewModel) => res.render('utilisation-reports/add-payment.njk', context);

const mapToRecordedPaymentDetailsViewModel = (payment: SelectedFeeRecordsPaymentDetailsResponse): RecordedPaymentDetailsViewModel => {
  return {
    reference: payment.reference,
    formattedCurrencyAndAmount: getFormattedCurrencyAndAmount({ currency: payment.currency, amount: payment.amount }),
    formattedDateReceived: format(parseISO(payment.dateReceived), 'd MMM yyyy'),
  };
};

const mapToSelectedReportedFeesDetailsViewModel = (selectedFeeRecordData: SelectedFeeRecordsDetailsResponseBody): SelectedReportedFeesDetailsViewModel => {
  const reportedFeeDataSortValueMap = getKeyToCurrencyAndAmountSortValueMap(
    selectedFeeRecordData.feeRecords.map((record) => ({ ...record.reportedFee, key: record.id })),
  );
  const reportedPaymentsDataSortValueMap = getKeyToCurrencyAndAmountSortValueMap(
    selectedFeeRecordData.feeRecords.map((record) => ({ ...record.reportedPayments, key: record.id })),
  );
  return {
    totalReportedPayments: getFormattedCurrencyAndAmount(selectedFeeRecordData.totalReportedPayments),
    feeRecords: selectedFeeRecordData.feeRecords.map((record) => ({
      feeRecordId: record.id,
      facilityId: record.facilityId,
      exporter: record.exporter,
      reportedFee: { value: getFormattedCurrencyAndAmount(record.reportedFee), dataSortValue: reportedFeeDataSortValueMap[record.id] },
      reportedPayments: { value: getFormattedCurrencyAndAmount(record.reportedPayments), dataSortValue: reportedPaymentsDataSortValueMap[record.id] },
    })),
  };
};

const extractAddPaymentFormValuesAndValidateIfPresent = (
  requestBody: AddPaymentRequestBody,
  feeRecordPaymentCurrency: Currency,
): { isAddingPayment: boolean; errors: AddPaymentErrorsViewModel; formValues: AddPaymentFormValues } => {
  const isAddingPayment = 'addPaymentFormSubmission' in requestBody;

  if (!isAddingPayment) {
    return {
      isAddingPayment,
      errors: EMPTY_ADD_PAYMENT_ERRORS,
      formValues: EMPTY_ADD_PAYMENT_FORM_VALUES,
    };
  }

  const formValues = extractFormValuesFromRequestBody(requestBody);
  const errors = validateAddPaymentRequestFormValues(formValues, feeRecordPaymentCurrency);
  return {
    isAddingPayment,
    formValues,
    errors,
  };
};

export const addPayment = async (req: AddPaymentRequest, res: Response) => {
  try {
    const { user, userToken } = asUserSession(req.session);
    const { reportId } = req.params;
    const checkedCheckboxIds = getPremiumPaymentsCheckboxIdsFromObjectKeys(req.body);
    const feeRecordPaymentCurrency = getFeeRecordPaymentCurrencyFromPremiumPaymentsCheckboxId(checkedCheckboxIds[0]);
    const feeRecordIds = getFeeRecordIdsFromPremiumPaymentsCheckboxIds(checkedCheckboxIds);

    const { isAddingPayment, errors, formValues } = extractAddPaymentFormValuesAndValidateIfPresent(req.body, feeRecordPaymentCurrency);
    const formHasErrors = errors.errorSummary.length !== 0;

    if (isAddingPayment && !formHasErrors) {
      const { addAnotherPayment, ...paymentFormValues } = formValues as ValidatedAddPaymentFormValues;
      const parsedAddPaymentFormValues = parseValidatedAddPaymentFormValues(paymentFormValues);
      await api.addPaymentToFeeRecords(reportId, parsedAddPaymentFormValues, feeRecordIds, user, userToken);
      if (addAnotherPayment !== 'true') {
        return res.redirect(`/utilisation-reports/${reportId}`);
      }
    }

    const selectedFeeRecordDetails = await api.getSelectedFeeRecordsDetails(reportId, feeRecordIds, userToken);
    return renderAddPaymentPage(res, {
      user,
      activePrimaryNavigation: PRIMARY_NAVIGATION_KEYS.UTILISATION_REPORTS,
      reportId,
      selectedFeeRecordCheckboxIds: checkedCheckboxIds,
      errors,
      formValues: formHasErrors ? formValues : EMPTY_ADD_PAYMENT_FORM_VALUES,
      paymentNumber: undefined,
      bank: selectedFeeRecordDetails.bank,
      formattedReportPeriod: getFormattedReportPeriodWithLongMonth(selectedFeeRecordDetails.reportPeriod),
      reportedFeeDetails: mapToSelectedReportedFeesDetailsViewModel(selectedFeeRecordDetails),
      recordedPaymentsDetails: selectedFeeRecordDetails.payments.map((payment) => mapToRecordedPaymentDetailsViewModel(payment)),
      multipleFeeRecordsSelected: selectedFeeRecordDetails.feeRecords.length > 1,
    });
  } catch (error) {
    console.error('Failed to add payment', error);
    return res.render('_partials/problem-with-service.njk', { user: req.session.user });
  }
};
