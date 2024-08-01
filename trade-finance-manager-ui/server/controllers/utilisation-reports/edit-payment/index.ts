import { Request, Response } from 'express';
import api from '../../../api';
import { asUserSession } from '../../../helpers/express-session';
import { EditPaymentViewModel } from '../../../types/view-models';
import {
  EditPaymentFormRequestBody,
  extractEditPaymentFormValues,
  getEditPaymentViewModel,
  getEditPaymentViewModelWithFormValues,
  parseValidatedEditPaymentFormValues,
  validateEditPaymentRequestFormValues,
} from '../helpers';
import { CustomExpressRequest } from '../../../types/custom-express-request';
import { ValidatedEditPaymentFormValues } from '../../../types/edit-payment-form-values';
import { getAndClearFieldsFromRedirectSessionData } from './get-and-clear-fields-from-redirect-session-data';
import { getEditPaymentsCheckboxIdsFromObjectKeys } from '../../../helpers/edit-payments-table-checkbox-id-helper';
import { EditPaymentsTableCheckboxId } from '../../../types/edit-payments-table-checkbox-id';

const renderEditPaymentPage = (res: Response, viewModel: EditPaymentViewModel) => res.render('utilisation-reports/edit-payment.njk', viewModel);

export const getEditPayment = async (req: Request, res: Response) => {
  const { userToken, user } = asUserSession(req.session);
  const { reportId, paymentId } = req.params;

  try {
    const { errors, formValues, allCheckboxesChecked } = getAndClearFieldsFromRedirectSessionData(req);
    const isCheckboxChecked = () => allCheckboxesChecked ?? false;

    const paymentDetails = await api.getPaymentDetailsWithFeeRecords(reportId, paymentId, userToken);

    if (formValues) {
      const editPaymentViewModel = getEditPaymentViewModelWithFormValues(paymentDetails, reportId, paymentId, isCheckboxChecked, formValues, errors);
      return renderEditPaymentPage(res, editPaymentViewModel);
    }

    const editPaymentViewModel = getEditPaymentViewModel(paymentDetails, reportId, paymentId, isCheckboxChecked, errors);
    return renderEditPaymentPage(res, editPaymentViewModel);
  } catch (error) {
    console.error('Error updating utilisation report status:', error);
    return res.render('_partials/problem-with-service.njk', { user });
  }
};

export type PostEditPaymentRequest = CustomExpressRequest<{
  reqBody: EditPaymentFormRequestBody & Partial<Record<EditPaymentsTableCheckboxId, 'on'>>;
}>;

export const postEditPayment = async (req: PostEditPaymentRequest, res: Response) => {
  const { userToken, user } = asUserSession(req.session);
  const { reportId, paymentId } = req.params;

  try {
    const formValues = extractEditPaymentFormValues(req.body);
    const editPaymentErrors = validateEditPaymentRequestFormValues(formValues);

    const formHasErrors = editPaymentErrors.errorSummary.length !== 0;

    if (!formHasErrors) {
      const parsedEditPaymentFormValues = parseValidatedEditPaymentFormValues(formValues as ValidatedEditPaymentFormValues);
      await api.editPayment(reportId, paymentId, parsedEditPaymentFormValues, user, userToken);
      return res.redirect(`/utilisation-reports/${reportId}`);
    }

    const checkedCheckboxIds = new Set(getEditPaymentsCheckboxIdsFromObjectKeys(req.body));
    const isCheckboxChecked = (checkboxId: EditPaymentsTableCheckboxId): boolean => checkedCheckboxIds.has(checkboxId);

    const paymentDetails = await api.getPaymentDetailsWithFeeRecords(reportId, paymentId, userToken);
    const editPaymentViewModel = getEditPaymentViewModelWithFormValues(paymentDetails, reportId, paymentId, isCheckboxChecked, formValues, editPaymentErrors);
    return renderEditPaymentPage(res, editPaymentViewModel);
  } catch (error) {
    console.error('Error updating utilisation report status:', error);
    return res.render('_partials/problem-with-service.njk', { user });
  }
};
