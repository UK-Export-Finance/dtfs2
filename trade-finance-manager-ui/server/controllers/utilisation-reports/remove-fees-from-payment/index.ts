import { Response } from 'express';
import { CustomExpressRequest } from '../../../types/custom-express-request';
import { getEditPaymentsCheckboxIdsFromObjectKeys, getFeeRecordIdsFromEditPaymentsCheckboxIds } from '../../../helpers/edit-payments-table-checkbox-id-helper';
import { RemoveFeesFromPaymentFormRequestBody } from '../../../helpers/remove-fees-from-payment-helper';

export type RemoveFeesFromPaymentRequest = CustomExpressRequest<{
  reqBody: RemoveFeesFromPaymentFormRequestBody;
}>;

export const postRemoveFeesFromPayment = (req: RemoveFeesFromPaymentRequest, res: Response) => {
  try {
    const { reportId, paymentId } = req.params;
    const checkedCheckboxIds = getEditPaymentsCheckboxIdsFromObjectKeys(req.body);
    getFeeRecordIdsFromEditPaymentsCheckboxIds(checkedCheckboxIds);

    // TODO - FN-1719 PR 2: Make and await API call, extracting and passing through feeRecordIds, paymentId, etc from the request.
    return res.redirect(`/utilisation-reports/${reportId}/edit-payment/${paymentId}`);
  } catch (error) {
    console.error('Failed to remove fees from payment', error);
    return res.render('_partials/problem-with-service.njk', { user: req.session.user });
  }
};
