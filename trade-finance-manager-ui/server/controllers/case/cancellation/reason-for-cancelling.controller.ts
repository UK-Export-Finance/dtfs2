import { Response } from 'express';
import { CustomExpressRequest } from '@ukef/dtfs2-common';
import { PRIMARY_NAVIGATION_KEYS } from '../../../constants';
import { asUserSession } from '../../../helpers/express-session';
import { ReasonForCancellingViewModel } from '../../../types/view-models';
import { validateReasonForCancelling } from './validation/validate-reason-for-cancelling';
import api from '../../../api';
import { canSubmissionTypeBeCancelled } from '../../helpers';

export type GetReasonForCancellingRequest = CustomExpressRequest<{ params: { _id: string } }>;
export type PostReasonForCancellingRequest = CustomExpressRequest<{ params: { _id: string }; reqBody: { reason: string } }>;

/**
 * controller to get the reason for cancelling page
 *
 * @param req - The express request
 * @param res - The express response
 */
export const getReasonForCancelling = async (req: GetReasonForCancellingRequest, res: Response) => {
  const { _id } = req.params;
  const { status } = req.query;
  const { user, userToken } = asUserSession(req.session);

  try {
    const deal = await api.getDeal(_id, userToken);

    if (!deal || 'status' in deal) {
      return res.redirect('/not-found');
    }

    if (!canSubmissionTypeBeCancelled(deal.dealSnapshot.submissionType)) {
      return res.redirect(`/case/${_id}/deal`);
    }

    const cancellation = await api.getDealCancellation(_id, userToken);

    const reasonForCancellingViewModel: ReasonForCancellingViewModel = {
      activePrimaryNavigation: PRIMARY_NAVIGATION_KEYS.ALL_DEALS,
      user,
      ukefDealId: deal.dealSnapshot.details.ukefDealId,
      dealId: _id,
      reasonForCancelling: cancellation?.reason,
      previousPage: status === 'change' ? `/case/${_id}/cancellation/check-details` : `/case/${_id}/deal`,
    };
    return res.render('case/cancellation/reason-for-cancelling.njk', reasonForCancellingViewModel);
  } catch (error) {
    console.error('Error getting reason for cancelling', error);
    return res.render('_partials/problem-with-service.njk');
  }
};

/**
 * controller to update the reason for cancelling
 *
 * @param req - The express request
 * @param res - The express response
 */
export const postReasonForCancelling = async (req: PostReasonForCancellingRequest, res: Response) => {
  const { _id } = req.params;
  const { status } = req.query;
  const { reason } = req.body;
  const { user, userToken } = asUserSession(req.session);

  try {
    const deal = await api.getDeal(_id, userToken);

    if (!deal || 'status' in deal) {
      return res.redirect('/not-found');
    }

    if (!canSubmissionTypeBeCancelled(deal.dealSnapshot.submissionType)) {
      return res.redirect(`/case/${_id}/deal`);
    }

    const validationErrors = validateReasonForCancelling(reason);

    const formHasErrors = validationErrors.errorSummary.length !== 0;

    if (formHasErrors) {
      const reasonForCancellingViewModel: ReasonForCancellingViewModel = {
        activePrimaryNavigation: PRIMARY_NAVIGATION_KEYS.ALL_DEALS,
        user,
        ukefDealId: deal.dealSnapshot.details.ukefDealId,
        dealId: _id,
        errors: validationErrors,
        reasonForCancelling: reason,
        previousPage: status === 'change' ? `/case/${_id}/cancellation/check-details` : `/case/${_id}/deal`,
      };

      return res.render('case/cancellation/reason-for-cancelling.njk', reasonForCancellingViewModel);
    }

    await api.updateDealCancellation(_id, { reason }, userToken);

    return res.redirect(`/case/${_id}/cancellation/bank-request-date`);
  } catch (error) {
    console.error('Error updating reason for cancelling', error);
    return res.render('_partials/problem-with-service.njk');
  }
};
