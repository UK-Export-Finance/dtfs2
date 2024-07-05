import { Response } from 'express';
import { CustomExpressRequest } from '../../../types/custom-express-request';
import { AddPaymentFormRequestBody } from '../helpers';
import {
  getEditPaymentsCheckboxIdsFromObjectKeys,
  getFeeRecordIdsFromEditPaymentsCheckboxIds,
} from '../../../helpers/edit-payments-table-checkbox-id-helper';

export type AddPaymentRequest = CustomExpressRequest<{
  reqBody: AddPaymentFormRequestBody;
}>;

export const postUnlinkPaymentFees = (req: AddPaymentRequest, res: Response) => {
  try {
    const { reportId, paymentId } = req.params;
    const checkedCheckboxIds = getEditPaymentsCheckboxIdsFromObjectKeys(req.body);
    const feeRecordIds = getFeeRecordIdsFromEditPaymentsCheckboxIds(checkedCheckboxIds);

    // TODO - FN-1719 PR 2: Remove after adding the API call logic.
    // eslint-disable-next-line no-console
    console.log('feeRecordIds:', feeRecordIds);

    // TODO - FN-1719 PR 2: Make and await API call passing through feeRecordIds, paymentId, etc.
    return res.redirect(`/utilisation-reports/${reportId}/edit-payment/${paymentId}`);
  } catch (error) {
    console.error('Failed to unlink payment fees', error);
    return res.render('_partials/problem-with-service.njk', { user: req.session.user });
  }
};
