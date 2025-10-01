import { Response } from 'express';
import { CustomExpressRequest } from '@ukef/dtfs2-common';
import { getEditPaymentsCheckboxIdsFromObjectKeys, getFeeRecordIdsFromEditPaymentsCheckboxIds } from '../../../helpers/edit-payments-table-checkbox-id-helper';
import { RemoveFeesFromPaymentFormRequestBody } from '../../../helpers/remove-fees-from-payment-helper';
import api from '../../../api';
import { asUserSession } from '../../../helpers/express-session';
import { extractEditPaymentFormValues } from '../helpers';
import { ReconciliationForReportTab } from '../../../types/reconciliation-for-report-tab';

export type RemoveFeesFromPaymentRequest = CustomExpressRequest<{
  reqBody: RemoveFeesFromPaymentFormRequestBody;
  query: {
    redirectTab?: ReconciliationForReportTab;
  };
}>;

/**
 * Controller to remove fees from payment
 * @async
 * @function postRemoveFeesFromPayment
 * @param req - The Express request object.
 * @param  res - The Express response object.
 * @returns
 */
export const postRemoveFeesFromPayment = async (req: RemoveFeesFromPaymentRequest, res: Response) => {
  try {
    const { user, userToken } = asUserSession(req.session);
    const { reportId, paymentId } = req.params;
    const { redirectTab } = req.query;

    req.session.editPaymentFormValues = extractEditPaymentFormValues(req.body);

    const checkedCheckboxIds = getEditPaymentsCheckboxIdsFromObjectKeys(req.body);
    const selectedFeeRecordIds = getFeeRecordIdsFromEditPaymentsCheckboxIds(checkedCheckboxIds);

    await api.removeFeesFromPayment(reportId, paymentId, selectedFeeRecordIds, user, userToken);

    return res.redirect(`/utilisation-reports/${reportId}/edit-payment/${paymentId}?redirectTab=${redirectTab}`);
  } catch (error) {
    console.error('Failed to remove fees from payment', error);
    return res.render('_partials/problem-with-service.njk', { user: req.session.user });
  }
};
