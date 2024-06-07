import { Response } from 'express';
import { Currency, SelectedFeeRecordsDetails, getFormattedCurrencyAndAmount, getFormattedReportPeriodWithLongMonth } from '@ukef/dtfs2-common';
import { AddPaymentErrorsViewModel, AddPaymentViewModel, SelectedReportedFeesDetailsViewModel } from '../../../types/view-models';
import api from '../../../api';
import { asUserSession } from '../../../helpers/express-session';
import {
  getFeeRecordIdFromPremiumPaymentsCheckboxId,
  getFeeRecordPaymentCurrencyFromPremiumPaymentsCheckboxId,
  getPremiumPaymentsCheckboxIdsFromObjectKeys,
} from '../../../helpers/premium-payments-table-checkbox-id-helper';
import { CustomExpressRequest } from '../../../types/custom-express-request';
import { PremiumPaymentsTableCheckboxId } from '../../../types/premium-payments-table-checkbox-id';
import { validateAddPaymentRequestFormValues } from './add-payment-form-values-validator';
import { AddPaymentFormValues } from '../../../types/add-payment-form-values';
import { PRIMARY_NAVIGATION_KEYS } from '../../../constants';
import { getKeyToCurrencyAndAmountSortValueMap } from '../helpers';

export type AddPaymentRequestBody = Record<PremiumPaymentsTableCheckboxId, 'on'> & {
  paymentCurrency?: string;
  paymentNumber?: string;
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

const mapToSelectedReportedFeesDetailsViewModel = (selectedFeeRecordData: SelectedFeeRecordsDetails): SelectedReportedFeesDetailsViewModel => {
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
): { isAddingPayment: boolean; errors: AddPaymentErrorsViewModel; formValues: AddPaymentFormValues; paymentNumber?: number } => {
  const isAddingPayment = 'addPaymentFormSubmission' in requestBody;

  if (!isAddingPayment) {
    return {
      isAddingPayment,
      errors: EMPTY_ADD_PAYMENT_ERRORS,
      formValues: EMPTY_ADD_PAYMENT_FORM_VALUES,
    };
  }

  const paymentNumber = Number(requestBody.paymentNumber);

  const formValues = extractFormValuesFromRequestBody(requestBody);
  const errors = validateAddPaymentRequestFormValues(formValues, feeRecordPaymentCurrency);
  return {
    isAddingPayment,
    formValues,
    errors,
    paymentNumber,
  };
};

export const addPayment = async (req: AddPaymentRequest, res: Response) => {
  try {
    const { user, userToken } = asUserSession(req.session);
    const { reportId } = req.params;
    const checkedCheckboxIds = getPremiumPaymentsCheckboxIdsFromObjectKeys(req.body);
    const feeRecordIds = checkedCheckboxIds.map((checkboxId) => getFeeRecordIdFromPremiumPaymentsCheckboxId(checkboxId));
    const feeRecordPaymentCurrency = getFeeRecordPaymentCurrencyFromPremiumPaymentsCheckboxId(checkedCheckboxIds[0]);

    const { isAddingPayment, errors, formValues, paymentNumber } = extractAddPaymentFormValuesAndValidateIfPresent(req.body, feeRecordPaymentCurrency);
    const canSubmitFormValues = errors.errorSummary.length === 0;

    if (isAddingPayment && canSubmitFormValues) {
      const { addAnotherPayment, ...paymentFormValues } = formValues;
      await api.addPaymentToFeeRecords(reportId, paymentFormValues, feeRecordIds, user, userToken);
      if (addAnotherPayment && addAnotherPayment !== 'true') {
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
      formValues: canSubmitFormValues ? EMPTY_ADD_PAYMENT_FORM_VALUES : formValues,
      paymentNumber,
      bank: selectedFeeRecordDetails.bank,
      formattedReportPeriod: getFormattedReportPeriodWithLongMonth(selectedFeeRecordDetails.reportPeriod),
      reportedFeeDetails: mapToSelectedReportedFeesDetailsViewModel(selectedFeeRecordDetails),
    });
  } catch (error) {
    console.error('Failed to add payment', error);
    return res.render('_partials/problem-with-service.njk', { user: req.session.user });
  }
};
