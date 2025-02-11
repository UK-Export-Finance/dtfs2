import { CustomExpressRequest, PORTAL_AMENDMENT_STATUS } from '@ukef/dtfs2-common';
import { Response } from 'express';
import * as api from '../../../services/api';
import { asLoggedInUserSession } from '../../../utils/express-session';

export type GetSubmittedForCheckingRequest = CustomExpressRequest<{
  params: { dealId: string; facilityId: string; amendmentId: string };
}>;

/**
 * controller to get the submitted for checking amendment page
 *
 * @param req - The express request
 * @param res - The express response
 */
export const getSubmittedForChecking = async (req: GetSubmittedForCheckingRequest, res: Response) => {
  try {
    const { facilityId, amendmentId } = req.params;
    const { userToken } = asLoggedInUserSession(req.session);

    const amendment = await api.getAmendment({ facilityId, amendmentId, userToken });

    if (!amendment) {
      console.error('Amendment %s not found on facility %s', amendmentId, facilityId);
      return res.redirect('/not-found');
    }

    if (!(amendment.status === PORTAL_AMENDMENT_STATUS.READY_FOR_CHECKERS_APPROVAL)) {
      console.error("Amendment %s on facility %s is not ready for checker's approval", amendmentId, facilityId);
      return res.redirect('/not-found');
    }

    return res.render('partials/amendments/submitted-for-checking.njk');
  } catch (error) {
    console.error('Error getting submitted for checking amendment page %o', error);
    return res.render('partials/problem-with-service.njk');
  }
};
