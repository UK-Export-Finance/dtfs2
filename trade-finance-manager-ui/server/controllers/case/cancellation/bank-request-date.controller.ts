import { Response } from 'express';
import { CustomExpressRequest } from '@ukef/dtfs2-common';
import { PRIMARY_NAVIGATION_KEYS } from '../../../constants';
import { asUserSession } from '../../../helpers/express-session';
import { BankRequestDateViewModel } from '../../../types/view-models';

export type GetBankRequestDateRequest = CustomExpressRequest<{ params: { _id: string } }>;

/**
 * controller to get the bank request date page
 *
 * @param req - The express request
 * @param res - The express response
 */
export const getBankRequestDate = (req: GetBankRequestDateRequest, res: Response) => {
  const { _id } = req.params;
  const { user } = asUserSession(req.session);

  // TODO DTFS2-7409: Check deal type allows for cancellation and deal hasn't already been cancelled

  const bankRequestDateViewModel: BankRequestDateViewModel = {
    activePrimaryNavigation: PRIMARY_NAVIGATION_KEYS.ALL_DEALS,
    user,
    ukefDealId: '0040613574', // TODO DTFS2-7409: get values from database
    dealId: _id,
  };
  return res.render('case/cancellation/bank-request-date.njk', bankRequestDateViewModel);
};
