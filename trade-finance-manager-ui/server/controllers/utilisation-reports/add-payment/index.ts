import { Response } from 'express';
import { SelectedFeeRecordDetails, SelectedFeeRecordsDetails, getFormattedCurrencyAndAmount, getFormattedReportPeriodWithLongMonth } from '@ukef/dtfs2-common';
import { AddPaymentErrorsViewModel, AddPaymentViewModel, SelectedReportedFeeViewModel, SelectedReportedFeesDetailsViewModel } from '../../../types/view-models';
import api from '../../../api';
import { asUserSession } from '../../../helpers/express-session';
import {
  getFeeRecordIdFromPremiumPaymentsCheckboxId,
  getPremiumPaymentsCheckboxIdsFromObjectKeys,
} from '../../../helpers/premium-payments-table-checkbox-id-helper';
import { CustomExpressRequest } from '../../../types/custom-express-request';
import { PremiumPaymentsTableCheckboxId } from '../../../types/premium-payments-table-checkbox-id';
import { validateAddPaymentRequestFormValues } from './add-payment-form-values-validator';
import { AddPaymentFormValues } from '../../../types/add-payment-form-values';
import { PRIMARY_NAVIGATION_KEYS } from '../../../constants';

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

const mapToSelectedReportedFeeViewModel = (feeRecord: SelectedFeeRecordDetails): SelectedReportedFeeViewModel => ({
  feeRecordId: feeRecord.id,
  facilityId: feeRecord.facilityId,
  exporter: feeRecord.exporter,
  reportedFee: getFormattedCurrencyAndAmount(feeRecord.reportedFee),
  reportedPayments: getFormattedCurrencyAndAmount(feeRecord.reportedPayments),
});

const mapToSelectedReportedFeesDetailsViewModel = (selectedFeeRecordData: SelectedFeeRecordsDetails): SelectedReportedFeesDetailsViewModel => ({
  totalReportedPayments: getFormattedCurrencyAndAmount(selectedFeeRecordData.totalReportedPayments),
  feeRecords: selectedFeeRecordData.feeRecords.map((record) => mapToSelectedReportedFeeViewModel(record)),
});

export const addPayment = async (req: AddPaymentRequest, res: Response) => {
  try {
    const { user, userToken } = asUserSession(req.session);
    const { reportId } = req.params;
    const checkedCheckboxIds = getPremiumPaymentsCheckboxIdsFromObjectKeys(req.body);
    const feeRecordIds = checkedCheckboxIds.map((checkboxId) => getFeeRecordIdFromPremiumPaymentsCheckboxId(checkboxId));

    let paymentNumber;
    let errors: AddPaymentErrorsViewModel = { errorSummary: [] };
    let formValues: AddPaymentFormValues = { paymentDate: {} };
    if ('addPaymentFormSubmission' in req.body) {
      paymentNumber = Number(req.body.paymentNumber);
      formValues = extractFormValuesFromRequestBody(req.body);
      errors = validateAddPaymentRequestFormValues(formValues);
      if (errors.errorSummary.length === 0) {
        // TODO FN-1739 save data upon valid submission
        return res.status(501).send('Your request was valid, but we have not finished building the feature');
      }
    }

    const selectedFeeRecordDetails = await api.getSelectedFeeRecordsDetails(Number(reportId), feeRecordIds, userToken);
    return renderAddPaymentPage(res, {
      user,
      activePrimaryNavigation: PRIMARY_NAVIGATION_KEYS.UTILISATION_REPORTS,
      reportId: Number(reportId),
      selectedFeeRecordCheckboxIds: checkedCheckboxIds,
      errors,
      formValues,
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
