import { Response } from 'express';
import { CustomExpressRequest } from '../../../../types/custom-express-request';
import { getLinkToPremiumPaymentsTab } from '../../helpers';
import { asUserSession } from '../../../../helpers/express-session';
import api from '../../../../api';

export type PostCancelRecordCorrectionRequestRequest = CustomExpressRequest<{
  params: {
    reportId: string;
    feeRecordId: string;
  };
}>;

// TODO FN-3690: Need to add tests for this controller.
/**
 * Controller for the POST cancel record correction request route
 * @param req - The request object
 * @param res - The response object
 */
export const postCancelRecordCorrectionRequest = async (req: PostCancelRecordCorrectionRequestRequest, res: Response) => {
  try {
    const { reportId, feeRecordId } = req.params;
    const { user, userToken } = asUserSession(req.session);

    await api.deleteFeeRecordCorrectionTransientFormData(reportId, feeRecordId, user, userToken);

    return res.redirect(getLinkToPremiumPaymentsTab(reportId, [Number(feeRecordId)]));
  } catch (error) {
    console.error('Failed to post cancel record correction request', error);
    return res.render('_partials/problem-with-service.njk', { user: req.session.user });
  }
};
