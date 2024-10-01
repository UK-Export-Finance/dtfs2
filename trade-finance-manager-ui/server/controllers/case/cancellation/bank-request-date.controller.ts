import { Response } from 'express';
import { CustomExpressRequest } from '@ukef/dtfs2-common';
import { format } from 'date-fns';
import { PRIMARY_NAVIGATION_KEYS } from '../../../constants';
import { asUserSession } from '../../../helpers/express-session';
import { BankRequestDateViewModel } from '../../../types/view-models';
import { validateBankRequestDate } from './validation/validate-bank-request-date';
import api from '../../../api';
import { canSubmissionTypeBeCancelled } from '../../helpers';

export type GetBankRequestDateRequest = CustomExpressRequest<{ params: { _id: string } }>;
export type PostBankRequestDateRequest = CustomExpressRequest<{
  params: { _id: string };
  reqBody: { 'bank-request-date-day': string; 'bank-request-date-month': string; 'bank-request-date-year': string };
}>;

/**
 * controller to get the bank request date page
 *
 * @param req - The express request
 * @param res - The express response
 */
export const getBankRequestDate = async (req: GetBankRequestDateRequest, res: Response) => {
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

    const previouslyEnteredBankRequestDate = cancellation?.bankRequestDate ? new Date(cancellation.bankRequestDate) : undefined;

    const day = previouslyEnteredBankRequestDate ? format(previouslyEnteredBankRequestDate, 'd') : '';
    const month = previouslyEnteredBankRequestDate ? format(previouslyEnteredBankRequestDate, 'M') : '';
    const year = previouslyEnteredBankRequestDate ? format(previouslyEnteredBankRequestDate, 'yyyy') : '';

    const bankRequestDateViewModel: BankRequestDateViewModel = {
      activePrimaryNavigation: PRIMARY_NAVIGATION_KEYS.ALL_DEALS,
      user,
      ukefDealId: deal.dealSnapshot.details.ukefDealId,
      dealId: _id,
      day,
      month,
      year,
    };
    return res.render('case/cancellation/bank-request-date.njk', bankRequestDateViewModel);
  } catch (error) {
    console.error('Error getting bank request date', error);
    return res.render('_partials/problem-with-service.njk');
  }
};

/**
 * controller to update the bank request date
 *
 * @param req - The express request
 * @param res - The express response
 */
export const postBankRequestDate = async (req: PostBankRequestDateRequest, res: Response) => {
  const { _id } = req.params;
  const { 'bank-request-date-day': day, 'bank-request-date-month': month, 'bank-request-date-year': year } = req.body;
  const { user, userToken } = asUserSession(req.session);

  try {
    const deal = await api.getDeal(_id, userToken);

    if (!deal || 'status' in deal) {
      return res.redirect('/not-found');
    }

    if (!canSubmissionTypeBeCancelled(deal.dealSnapshot.submissionType)) {
      return res.redirect(`/case/${_id}/deal`);
    }

    const { errors: validationErrors, bankRequestDate } = validateBankRequestDate({ day, month, year });

    if (validationErrors) {
      const bankRequestDateViewModel: BankRequestDateViewModel = {
        activePrimaryNavigation: PRIMARY_NAVIGATION_KEYS.ALL_DEALS,
        user,
        ukefDealId: deal.dealSnapshot.details.ukefDealId,
        dealId: _id,
        day,
        month,
        year,
        errors: validationErrors,
      };
      return res.render('case/cancellation/bank-request-date.njk', bankRequestDateViewModel);
    }
    await api.updateDealCancellation(_id, { bankRequestDate: bankRequestDate?.valueOf() }, userToken);

    return res.redirect(`/case/${_id}/cancellation/effective-from-date`);
  } catch (error) {
    console.error('Error updating bank request date', error);
    return res.render('_partials/problem-with-service.njk');
  }
};
