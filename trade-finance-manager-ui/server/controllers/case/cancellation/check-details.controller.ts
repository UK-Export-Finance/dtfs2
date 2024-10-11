import { Response } from 'express';
import { CustomExpressRequest } from '@ukef/dtfs2-common';
import { isEmpty } from 'lodash';
import { format } from 'date-fns';
import { PRIMARY_NAVIGATION_KEYS } from '../../../constants';
import { asUserSession } from '../../../helpers/express-session';
import { canSubmissionTypeBeCancelled } from '../../helpers/deal-cancellation-enabled.helper';
import api from '../../../api';
import { CheckDetailsViewModel } from '../../../types/view-models';

export type GetDealCancellationDetailsRequest = CustomExpressRequest<{ params: { _id: string } }>;
export type PostDealCancellationDetailsRequest = CustomExpressRequest<{ params: { _id: string } }>;

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

    if (isEmpty(cancellation)) {
      return res.redirect(`/case/${_id}/deal`);
    }

    const { reason, bankRequestDate, effectiveFrom } = cancellation;

    const bankRequestDateFormatted = bankRequestDate ? format(new Date(bankRequestDate), 'd MMMM yyyy') : undefined;
    const effectiveFromDateFormatted = effectiveFrom ? format(new Date(effectiveFrom), 'd MMMM yyyy') : undefined;

    const effectiveFromDateViewModel: CheckDetailsViewModel = {
      activePrimaryNavigation: PRIMARY_NAVIGATION_KEYS.ALL_DEALS,
      user,
      ukefDealId: deal.dealSnapshot.details.ukefDealId,
      dealId: _id,
      reason,
      bankRequestDate: bankRequestDateFormatted,
      effectiveFromDate: effectiveFromDateFormatted,
    };
    return res.render('case/cancellation/check-details.njk', effectiveFromDateViewModel);
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
  const { userToken } = asUserSession(req.session);

  try {
    const deal = await api.getDeal(_id, userToken);

    if (!deal || 'status' in deal) {
      return res.redirect('/not-found');
    }

    if (!canSubmissionTypeBeCancelled(deal.dealSnapshot.submissionType)) {
      return res.redirect(`/case/${_id}/deal`);
    }

    // TODO: DTFS2-7298 - enact deal cancellation
    return res.redirect(`/case/${_id}/deal`);
  } catch (error) {
    console.error('Error cancelling deal', error);
    return res.render('_partials/problem-with-service.njk');
  }
};
