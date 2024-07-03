import { Response } from 'express';
import { CustomExpressRequest } from '../../../types/custom-express-request';
import { AddPaymentFormRequestBody } from '../helpers';
import {
  getEditPremiumPaymentsCheckboxIdsFromObjectKeys,
  getFeeRecordIdsFromEditPremiumPaymentsCheckboxIds,
} from '../../../helpers/edit-premium-payments-table-checkbox-id-helper';

export type AddPaymentRequest = CustomExpressRequest<{
  reqBody: AddPaymentFormRequestBody;
}>;

export const unlinkPaymentFees = (req: AddPaymentRequest, res: Response) => {
  try {
    const { reportId, paymentId } = req.params;
    const checkedCheckboxIds = getEditPremiumPaymentsCheckboxIdsFromObjectKeys(req.body);
    const feeRecordIds = getFeeRecordIdsFromEditPremiumPaymentsCheckboxIds(checkedCheckboxIds);

    // TODO: Remove after adding the API call logic.
    // eslint-disable-next-line no-console
    console.log('feeRecordIds:', feeRecordIds);

    // TODO: Make and await API call passing through feeRecordIds and paymentId.
    return res.redirect(`/utilisation-reports/${reportId}/edit-payment/${paymentId}`);
  } catch (error) {
    console.error('Failed to unlink payment fees', error);
    return res.render('_partials/problem-with-service.njk', { user: req.session.user });
  }
};
