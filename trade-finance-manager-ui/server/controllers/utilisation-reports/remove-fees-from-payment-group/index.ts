import { Response } from 'express';
import { CustomExpressRequest } from '../../../types/custom-express-request';
import { getEditPaymentsCheckboxIdsFromObjectKeys, getFeeRecordIdsFromEditPaymentsCheckboxIds } from '../../../helpers/edit-payments-table-checkbox-id-helper';
import { RemoveFeesFromPaymentGroupFormRequestBody } from '../../../helpers/remove-fees-from-payment-group-helper';
import api from '../../../api';
import { asUserSession } from '../../../helpers/express-session';

export type RemoveFeesFromPaymentGroupRequest = CustomExpressRequest<{
  reqBody: RemoveFeesFromPaymentGroupFormRequestBody;
}>;

export const postRemoveFeesFromPaymentGroup = async (req: RemoveFeesFromPaymentGroupRequest, res: Response) => {
  try {
    const { user, userToken } = asUserSession(req.session);
    const { reportId, paymentId } = req.params;

    const checkedCheckboxIds = getEditPaymentsCheckboxIdsFromObjectKeys(req.body);
    const selectedFeeRecordIds = getFeeRecordIdsFromEditPaymentsCheckboxIds(checkedCheckboxIds);

    await api.removeFeesFromPaymentGroup(reportId, paymentId, selectedFeeRecordIds, user, userToken);

    return res.redirect(`/utilisation-reports/${reportId}/edit-payment/${paymentId}`);
  } catch (error) {
    console.error('Failed to remove fees from payment', error);
    return res.render('_partials/problem-with-service.njk', { user: req.session.user });
  }
};
