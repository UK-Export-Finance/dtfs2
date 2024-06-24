import { Request, Response } from 'express';
import api from '../../../api';
import { asUserSession } from '../../../helpers/express-session';
import { EditPaymentViewModel } from '../../../types/view-models';
import {
  EditPaymentFormRequestBody,
  extractEditPaymentFormValues,
  getEditPaymentViewModel,
  getEditPaymentViewModelWithFormValuesAndErrors,
  validateEditPaymentRequestFormValues,
} from '../helpers';
import { CustomExpressRequest } from '../../../types/custom-express-request';

const renderEditPaymentPage = (res: Response, viewModel: EditPaymentViewModel) => res.render('utilisation-reports/edit-payment.njk', viewModel);

export const getEditPayment = async (req: Request, res: Response) => {
  const { userToken, user } = asUserSession(req.session);
  const { reportId, paymentId } = req.params;

  try {
    const editPaymentDetails = await api.getEditPaymentDetails(reportId, paymentId, userToken);
    const editPaymentViewModel = getEditPaymentViewModel(editPaymentDetails, reportId, paymentId);
    return renderEditPaymentPage(res, editPaymentViewModel);
  } catch (error) {
    console.error('Error updating utilisation report status:', error);
    return res.render('_partials/problem-with-service.njk', { user });
  }
};

export type PostEditPaymentRequest = CustomExpressRequest<{
  reqBody: EditPaymentFormRequestBody;
}>;

export const postEditPayment = async (req: PostEditPaymentRequest, res: Response) => {
  const { userToken, user } = asUserSession(req.session);
  const { reportId, paymentId } = req.params;

  try {
    const formValues = extractEditPaymentFormValues(req.body);
    const editPaymentErrors = validateEditPaymentRequestFormValues(formValues);

    const formHasErrors = editPaymentErrors.errorSummary.length !== 0;

    if (!formHasErrors) {
      return res.redirect(`/utilisation-reports/${reportId}`);
    }

    const editPaymentDetails = await api.getEditPaymentDetails(reportId, paymentId, userToken);
    const editPaymentViewModel = getEditPaymentViewModelWithFormValuesAndErrors(editPaymentDetails, reportId, paymentId, formValues, editPaymentErrors);
    return renderEditPaymentPage(res, editPaymentViewModel);
  } catch (error) {
    console.error('Error updating utilisation report status:', error);
    return res.render('_partials/problem-with-service.njk', { user });
  }
};
