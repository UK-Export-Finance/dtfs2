import { Request, Response, NextFunction } from 'express';
import { DEAL_STATUS } from '@ukef/dtfs2-common';
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
export const validateDealStatusForAmendment = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { dealId } = req.params;
    const { userToken } = asLoggedInUserSession(req.session);

    const deal = await api.getApplication({ dealId, userToken });

    if (!deal) {
      console.error('Deal %s was not found', dealId);
      return res.redirect('/not-found');
    }

    const dealStatusIsAcceptable = deal.status === DEAL_STATUS.UKEF_ACKNOWLEDGED;

    if (!dealStatusIsAcceptable) {
      console.error('Deal %s does not have the correct status to accept a facility amendment %s', dealId, deal.status);
      return res.redirect('/not-found');
    }

    return next();
  } catch (error) {
    console.error('Error validating amendment deal status %o', error);
    return res.render('partials/problem-with-service.njk');
  }
};
