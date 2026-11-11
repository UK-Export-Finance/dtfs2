import { Response } from 'express';
import { CustomExpressRequest } from '@ukef/dtfs2-common';
import { PRIMARY_NAVIGATION_KEYS } from '@tfm-ui/constants';
import { asUserSession } from '@tfm-ui/helpers/express-session';
import { CancelCancellationViewModel } from '@tfm-ui/types/view-models';
import api from '@tfm-ui/api';
import { canSubmissionTypeBeCancelled } from '@tfm-ui/controllers/helpers';
import { isDealCancellationInDraft } from '@tfm-ui/controllers/helpers/deal-cancellation-enabled.helper';
import { getPreviousPageUrl } from './helpers/get-previous-page-url';

export type GetCancelCancellationRequest = CustomExpressRequest<{ params: { _id: string } }>;
export type PostCancelCancellationRequest = CustomExpressRequest<{ params: { _id: string }; query: { return: string }; reqBody: { previousPage: string } }>;

/**
 * controller to get the cancel cancellation page
 *
 * @param req - The express request
 * @param res - The express response
 */
export const getCancelCancellation = async (req: GetCancelCancellationRequest, res: Response) => {
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

    const cancelCancellationViewModel: CancelCancellationViewModel = {
      activePrimaryNavigation: PRIMARY_NAVIGATION_KEYS.ALL_DEALS,
      user,
      ukefDealId: deal.dealSnapshot.details.ukefDealId,
      previousPage: req.headers.referer ?? `/case/${_id}/cancellation/reason`,
    };
    return res.render('case/cancellation/cancel.njk', cancelCancellationViewModel);
  } catch (error) {
    console.error('Error getting cancel cancellation page', error);
    return res.render('_partials/problem-with-service.njk');
  }
};

/**
 * controller to cancel the cancellation request
 *
 * @param req - The express request
 * @param res - The express response
 */
export const postCancelCancellation = async (req: PostCancelCancellationRequest, res: Response) => {
  const { _id } = req.params;
  const { userToken } = asUserSession(req.session);

  if (req.query.return) {
    return res.redirect(getPreviousPageUrl(req.body.previousPage, _id));
  }

  try {
    const deal = await api.getDeal(_id, userToken);

    if (!deal || 'status' in deal) {
      return res.redirect('/not-found');
    }

    if (!canSubmissionTypeBeCancelled(deal.dealSnapshot.submissionType)) {
      return res.redirect(`/case/${_id}/deal`);
    }

    await api.deleteDealCancellation(_id, userToken);

    return res.redirect(`/case/${_id}/deal`);
  } catch (error) {
    console.error('Error deleting the cancellation', error);
    return res.render('_partials/problem-with-service.njk');
  }
};
