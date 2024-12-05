import { Response } from 'express';
import { CustomExpressRequest } from '../../../../types/custom-express-request';
import { getLinkToPremiumPaymentsTab } from '../../helpers';

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
export const postCancelRecordCorrectionRequest = (req: PostCancelRecordCorrectionRequestRequest, res: Response) => {
  try {
    const { reportId, feeRecordId } = req.params;

    // TODO FN-3690: Call TFM API delete endpoint (to be added under this ticket), passing in the reportId, feeRecordId, user.

    return res.redirect(getLinkToPremiumPaymentsTab(reportId, [Number(feeRecordId)]));
  } catch (error) {
    console.error('Failed to post cancel record correction request', error);
    return res.render('_partials/problem-with-service.njk', { user: req.session.user });
  }
};
