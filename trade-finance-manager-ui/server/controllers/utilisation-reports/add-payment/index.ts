import { Response } from 'express';
import { FEE_RECORD_STATUS, getFormattedCurrencyAndAmount, getFormattedReportPeriodWithLongMonth } from '@ukef/dtfs2-common';
import { format, parseISO } from 'date-fns';
import { AddPaymentViewModel, RecordedPaymentDetailsViewModel } from '../../../types/view-models';
import api from '../../../api';
import { asUserSession } from '../../../helpers/express-session';
import {
  getFeeRecordIdsFromPremiumPaymentsCheckboxIds,
  getFeeRecordPaymentCurrencyFromPremiumPaymentsCheckboxId,
  getPremiumPaymentsCheckboxIdsFromObjectKeys,
} from '../../../helpers/premium-payments-table-checkbox-id-helper';
import { CustomExpressRequest } from '../../../types/custom-express-request';
import { ValidatedAddPaymentFormValues } from '../../../types/add-payment-form-values';
import { PRIMARY_NAVIGATION_KEYS } from '../../../constants';
import {
  parseValidatedAddPaymentFormValues,
  AddPaymentFormRequestBody,
  extractAddPaymentFormValuesAndValidateIfPresent,
  EMPTY_ADD_PAYMENT_FORM_VALUES,
  mapToSelectedReportedFeesDetailsViewModel,
} from '../helpers';
import { SelectedFeeRecordsPaymentDetailsResponse } from '../../../api-response-types';

export type AddPaymentRequest = CustomExpressRequest<{
  reqBody: AddPaymentFormRequestBody;
}>;

const renderAddPaymentPage = (res: Response, context: AddPaymentViewModel) => res.render('utilisation-reports/add-payment.njk', context);

const mapToRecordedPaymentDetailsViewModel = (payment: SelectedFeeRecordsPaymentDetailsResponse): RecordedPaymentDetailsViewModel => {
  return {
    reference: payment.reference,
    formattedCurrencyAndAmount: getFormattedCurrencyAndAmount({ currency: payment.currency, amount: payment.amount }),
    formattedDateReceived: format(parseISO(payment.dateReceived), 'd MMM yyyy'),
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

      const { feeRecordStatus } = await api.addPaymentToFeeRecords(reportId, parsedAddPaymentFormValues, feeRecordIds, user, userToken);
      if (addAnotherPayment !== 'true') {
        return res.redirect(`/utilisation-reports/${reportId}`);
      }

      if (feeRecordStatus === FEE_RECORD_STATUS.MATCH) {
        return res.redirect(`/utilisation-reports/${reportId}?matchSuccess=true`);
      }
    }

    const selectedFeeRecordDetails = await api.getSelectedFeeRecordsDetailsWithoutAvailablePaymentGroups(reportId, feeRecordIds, userToken);
    const paymentNumber = selectedFeeRecordDetails.payments.length + 1;

    return renderAddPaymentPage(res, {
      user,
      activePrimaryNavigation: PRIMARY_NAVIGATION_KEYS.UTILISATION_REPORTS,
      reportId,
      selectedFeeRecordCheckboxIds: checkedCheckboxIds,
      errors,
      formValues: formHasErrors ? formValues : EMPTY_ADD_PAYMENT_FORM_VALUES,
      paymentNumber,
      bank: selectedFeeRecordDetails.bank,
      formattedReportPeriod: getFormattedReportPeriodWithLongMonth(selectedFeeRecordDetails.reportPeriod),
      reportedFeeDetails: mapToSelectedReportedFeesDetailsViewModel(selectedFeeRecordDetails),
      recordedPaymentsDetails: selectedFeeRecordDetails.payments.map((payment) => mapToRecordedPaymentDetailsViewModel(payment)),
      multipleFeeRecordsSelected: selectedFeeRecordDetails.feeRecords.length > 1,
      canAddToExistingPayment: selectedFeeRecordDetails.canAddToExistingPayment,
    });
  } catch (error) {
    console.error('Failed to add payment', error);
    return res.render('_partials/problem-with-service.njk', { user: req.session.user });
  }
};
