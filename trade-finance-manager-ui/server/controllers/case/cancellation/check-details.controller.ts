import { Response } from 'express';
import { CustomExpressRequest } from '@ukef/dtfs2-common';
import { PRIMARY_NAVIGATION_KEYS } from '../../../constants';
import { asUserSession } from '../../../helpers/express-session';
import { canSubmissionTypeBeCancelled, isDealCancellationInDraft } from '../../helpers/deal-cancellation-enabled.helper';
import api from '../../../api';
import { CheckDetailsViewModel } from '../../../types/view-models';

export type GetDealCancellationDetailsRequest = CustomExpressRequest<{ params: { _id: string } }>;
export type PostDealCancellationDetailsRequest = CustomExpressRequest<{
  params: { _id: string };
  reqBody: { reason: string; effectiveFrom: string; bankRequestDate: string };
}>;

/**
 * controller to get deal cancellation details
 *
 * @param req - The express request
 * @param res - The express response
 */
export const getDealCancellationDetails = async (req: GetDealCancellationDetailsRequest, res: Response) => {
  const { _id } = req.params;
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

    if (!isDealCancellationInDraft(cancellation.status)) {
      return res.redirect(`/case/${_id}/deal`);
    }

    const checkDetailsViewModel: CheckDetailsViewModel = {
      activePrimaryNavigation: PRIMARY_NAVIGATION_KEYS.ALL_DEALS,
      user,
      ukefDealId: deal.dealSnapshot.details.ukefDealId,
      dealId: _id,
      cancellation,
    };

    return res.render('case/cancellation/check-details.njk', checkDetailsViewModel);
  } catch (error) {
    console.error('Error getting deal cancellation details', error);
    return res.render('_partials/problem-with-service.njk');
  }
};

/**
 * controller to post the deal cancellation
 *
 * @param req - The express request
 * @param res - The express response
 */
export const postDealCancellationDetails = async (req: PostDealCancellationDetailsRequest, res: Response) => {
  const { _id } = req.params;
  const { reason } = req.body;

  const bankRequestDate = Number(req.body.bankRequestDate);
  const effectiveFrom = Number(req.body.effectiveFrom);

  const { userToken } = asUserSession(req.session);

  try {
    const deal = await api.getDeal(_id, userToken);

    if (!deal || 'status' in deal) {
      return res.redirect('/not-found');
    }

    await api.submitDealCancellation(_id, { reason, bankRequestDate, effectiveFrom }, userToken);

    const { ukefDealId } = deal.dealSnapshot.details;
    const now = new Date();

    if (new Date(effectiveFrom) <= now) {
      req.flash('successMessage', `Deal ${ukefDealId} cancelled`);
    }

    return res.redirect(`/case/${_id}/deal`);
  } catch (error) {
    console.error('Error cancelling deal', error);
    return res.render('_partials/problem-with-service.njk');
  }
};
