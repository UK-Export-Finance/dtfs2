import { Response } from 'express';
import { CustomExpressRequest } from '@ukef/dtfs2-common';
import { format } from 'date-fns';
import { PRIMARY_NAVIGATION_KEYS } from '../../../constants';
import { asUserSession } from '../../../helpers/express-session';
import { EffectiveFromDateViewModel } from '../../../types/view-models';
import { validateEffectiveFromDate } from './validation/validate-effective-from-date';
import { canSubmissionTypeBeCancelled } from '../../helpers/deal-cancellation-enabled.helper';
import api from '../../../api';

export type GetEffectiveFromDateRequest = CustomExpressRequest<{ params: { _id: string }; query: { status?: string } }>;
export type PostEffectiveFromDateRequest = CustomExpressRequest<{
  params: { _id: string };
  query: { status?: string };
  reqBody: { 'effective-from-date-day': string; 'effective-from-date-month': string; 'effective-from-date-year': string };
}>;

/**
 * Gets the previous page URL to pass into the back link
 *
 * @param dealId - The deal ID
 * @param status - 'change' if user comes from the check answers page, otherwise undefined
 */
const getPreviousPage = (dealId: string, status?: string): string => {
  return status === 'change' ? `/case/${dealId}/cancellation/check-details` : `/case/${dealId}/cancellation/bank-request-date`;
};

/**
 * controller to get the effective from date page
 *
 * @param req - The express request
 * @param res - The express response
 */
export const getEffectiveFromDate = async (req: GetEffectiveFromDateRequest, res: Response) => {
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

    const previouslyEnteredEffectiveFromDate = cancellation?.effectiveFrom && new Date(cancellation.effectiveFrom);

    const day = previouslyEnteredEffectiveFromDate ? format(previouslyEnteredEffectiveFromDate, 'd') : '';
    const month = previouslyEnteredEffectiveFromDate ? format(previouslyEnteredEffectiveFromDate, 'M') : '';
    const year = previouslyEnteredEffectiveFromDate ? format(previouslyEnteredEffectiveFromDate, 'yyyy') : '';

    const effectiveFromDateViewModel: EffectiveFromDateViewModel = {
      activePrimaryNavigation: PRIMARY_NAVIGATION_KEYS.ALL_DEALS,
      user,
      ukefDealId: deal.dealSnapshot.details.ukefDealId,
      dealId: _id,
      day,
      month,
      year,
      previousPage: getPreviousPage(_id, status),
    };
    return res.render('case/cancellation/effective-from-date.njk', effectiveFromDateViewModel);
  } catch (error) {
    console.error('Error getting bank request date', error);
    return res.render('_partials/problem-with-service.njk');
  }
};

/**
 * controller to update the effective from date
 *
 * @param req - The express request
 * @param res - The express response
 */
export const postEffectiveFromDate = async (req: PostEffectiveFromDateRequest, res: Response) => {
  const { _id } = req.params;
  const { status } = req.query;
  const { 'effective-from-date-day': day, 'effective-from-date-month': month, 'effective-from-date-year': year } = req.body;
  const { user, userToken } = asUserSession(req.session);

  try {
    const deal = await api.getDeal(_id, userToken);

    if (!deal || 'status' in deal) {
      return res.redirect('/not-found');
    }

    if (!canSubmissionTypeBeCancelled(deal.dealSnapshot.submissionType)) {
      return res.redirect(`/case/${_id}/deal`);
    }

    const { errors: validationErrors, effectiveFromDate } = validateEffectiveFromDate({ day, month, year });

    if (validationErrors) {
      const effectiveFromDateViewModel: EffectiveFromDateViewModel = {
        activePrimaryNavigation: PRIMARY_NAVIGATION_KEYS.ALL_DEALS,
        user,
        ukefDealId: deal.dealSnapshot.details.ukefDealId,
        dealId: _id,
        day,
        month,
        year,
        errors: validationErrors,
        previousPage: getPreviousPage(_id, status),
      };

      return res.render('case/cancellation/effective-from-date.njk', effectiveFromDateViewModel);
    }
    await api.updateDealCancellation(_id, { effectiveFrom: effectiveFromDate?.valueOf() }, userToken);

    return res.redirect(`/case/${_id}/cancellation/check-details`);
  } catch (error) {
    console.error('Error updating effective from date', error);
    return res.render('_partials/problem-with-service.njk');
  }
};
