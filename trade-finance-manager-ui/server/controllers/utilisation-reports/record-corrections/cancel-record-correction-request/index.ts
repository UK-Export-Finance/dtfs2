import { Response } from 'express';
import { CustomExpressRequest } from '../../../../types/custom-express-request';
import { getLinkToPremiumPaymentsTab } from '../../helpers';
import { asUserSession } from '../../../../helpers/express-session';
import api from '../../../../api';

export type GetCancelRecordCorrectionRequest = CustomExpressRequest<{
  params: {
    reportId: string;
    feeRecordId: string;
  };
}>;

/**
 * Controller for the get cancel record correction request route.
 * Get as a link is pressed to cancel the record correction request (instead of a button)
 * Deletes the transient form data for the given report id, fee record id, and
 * user, then redirects to the premium payments tab with the given fee record
 * id selected.
 * @param req - The request object
 * @param res - The response object
 */
export const getCancelRecordCorrectionRequest = async (req: GetCancelRecordCorrectionRequest, res: Response) => {
  try {
    const { reportId, feeRecordId } = req.params;
    const { user, userToken } = asUserSession(req.session);

    await api.deleteFeeRecordCorrectionTransientFormData(reportId, feeRecordId, user, userToken);

    return res.redirect(getLinkToPremiumPaymentsTab(reportId, [Number(feeRecordId)]));
  } catch (error) {
    console.error('Failed to get cancel record correction request %o', error);
    return res.render('_partials/problem-with-service.njk', { user: req.session.user });
  }
};
