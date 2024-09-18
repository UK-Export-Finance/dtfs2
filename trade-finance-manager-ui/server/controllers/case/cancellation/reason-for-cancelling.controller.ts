import { Response } from 'express';
import { CustomExpressRequest } from '@ukef/dtfs2-common';
import { PRIMARY_NAVIGATION_KEYS } from '../../../constants';
import { asUserSession } from '../../../helpers/express-session';
import { ReasonForCancellingViewModel } from '../../../types/view-models';
import { validateReasonForCancelling } from './validation/validate-reason-for-cancelling';

export type GetReasonForCancellingRequest = CustomExpressRequest<{ params: { _id: string } }>;
export type PostReasonForCancellingRequest = CustomExpressRequest<{ params: { _id: string }; reqBody: { reason: string } }>;

/**
 * controller to get the reason for cancelling page
 *
 * @param req - The express request
 * @param res - The express response
 */
export const getReasonForCancelling = (req: GetReasonForCancellingRequest, res: Response) => {
  const { _id } = req.params;
  const { user } = asUserSession(req.session);

  const reasonForCancellingViewModel: ReasonForCancellingViewModel = {
    activePrimaryNavigation: PRIMARY_NAVIGATION_KEYS.ALL_DEALS,
    user,
    ukefDealId: '0040613574', // TODO: DTFS2-7350 get values from database
    dealId: _id,
  };
  return res.render('case/cancellation/reason-for-cancelling.njk', reasonForCancellingViewModel);
};

/**
 * controller to update the reason for cancelling
 *
 * @param req - The express request
 * @param res - The express response
 */
export const postReasonForCancelling = (req: PostReasonForCancellingRequest, res: Response) => {
  const { _id } = req.params;
  const { reason } = req.body;
  const { user } = asUserSession(req.session);

  const validationErrors = validateReasonForCancelling(reason);

  const formHasErrors = validationErrors.errorSummary.length !== 0;

  if (formHasErrors) {
    const reasonForCancellingViewModel: ReasonForCancellingViewModel = {
      activePrimaryNavigation: PRIMARY_NAVIGATION_KEYS.ALL_DEALS,
      user,
      ukefDealId: '0040613574', // TODO: DTFS2-7350 get values from database
      dealId: _id,
      errors: validationErrors,
      reasonForCancelling: reason,
    };

    return res.render('case/cancellation/reason-for-cancelling.njk', reasonForCancellingViewModel);
  }

  return res.redirect(`/case/${_id}/cancellation/bank-request-date`);
};
