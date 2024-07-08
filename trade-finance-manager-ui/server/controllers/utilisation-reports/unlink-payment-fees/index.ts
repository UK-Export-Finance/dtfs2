import { Response } from 'express';
import { CustomExpressRequest } from '../../../types/custom-express-request';
import { getEditPaymentsCheckboxIdsFromObjectKeys, getFeeRecordIdsFromEditPaymentsCheckboxIds } from '../../../helpers/edit-payments-table-checkbox-id-helper';
import { UnlinkPaymentFeesFormRequestBody } from '../../../helpers/unlink-payment-fees-helper';

export type UnlinkPaymentRequest = CustomExpressRequest<{
  reqBody: UnlinkPaymentFeesFormRequestBody;
}>;

export const postUnlinkPaymentFees = (req: UnlinkPaymentRequest, res: Response) => {
  try {
    const { reportId, paymentId } = req.params;
    const checkedCheckboxIds = getEditPaymentsCheckboxIdsFromObjectKeys(req.body);
    getFeeRecordIdsFromEditPaymentsCheckboxIds(checkedCheckboxIds);

    // TODO - FN-1719 PR 2: Make and await API call, extracting and passing through feeRecordIds, paymentId, etc from the request.
    return res.redirect(`/utilisation-reports/${reportId}/edit-payment/${paymentId}`);
  } catch (error) {
    console.error('Failed to unlink payment fees', error);
    return res.render('_partials/problem-with-service.njk', { user: req.session.user });
  }
};
