import { Request, Response, NextFunction } from 'express';
import { AMENDMENT_UNACCEPTABLE_DEAL_STATUSES } from '@ukef/dtfs2-common';
import { asLoggedInUserSession } from '../../utils/express-session';
import * as api from '../../services/api';

/**
 * middleware to validate the deal status for amendments
 * if the deal status is not acceptable for amendments eg cancelled
 * redirect to not-found page
 * else continue
 * @param req
 * @param res
 * @param next
 */
export const validateAmendmentDealStatus = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { dealId } = req.params;
    const { userToken } = asLoggedInUserSession(req.session);

    const deal = await api.getApplication({ dealId, userToken });

    if (!deal) {
      console.error('Deal %s was not found', dealId);
      return res.redirect('/not-found');
    }

    const dealStatusIsUnacceptable = AMENDMENT_UNACCEPTABLE_DEAL_STATUSES.includes(deal.status);

    if (dealStatusIsUnacceptable) {
      console.error('Deal %s does not have the correct status for amendments: %s', dealId, deal.status);
      return res.redirect('/not-found');
    }

    return next();
  } catch (error) {
    console.error('Error validating amendment deal status %o', error);
    return res.render('partials/problem-with-service.njk');
  }
};
