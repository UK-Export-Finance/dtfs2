import { CustomExpressRequest, PORTAL_AMENDMENT_STATUS } from '@ukef/dtfs2-common';
import { Response } from 'express';
import * as api from '../../../services/api';
import { asLoggedInUserSession } from '../../../utils/express-session';
import { userCanAmendFacility } from '../../../utils/facility-amendments.helper';
import { SubmittedForCheckingViewModel } from '../../../types/view-models/amendments/submitted-for-checking-view-model.ts';

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
    const { dealId, facilityId, amendmentId } = req.params;
    const { userToken, user } = asLoggedInUserSession(req.session);

    const deal = await api.getApplication({ dealId, userToken });
    const { details: facility } = await api.getFacility({ facilityId, userToken });

    if (!deal || !facility) {
      console.error('Deal %s or Facility %s was not found', dealId, facilityId);
      return res.redirect('/not-found');
    }

    if (!userCanAmendFacility(facility, deal, user.roles)) {
      console.error('User cannot amend facility %s on deal %s', facilityId, dealId);
      return res.redirect(`/gef/application-details/${dealId}`);
    }

    const amendment = await api.getAmendment({ facilityId, amendmentId, userToken });

    if (!amendment) {
      console.error('Amendment %s not found on facility %s', amendmentId, facilityId);
      return res.redirect('/not-found');
    }

    if (!(amendment.status === PORTAL_AMENDMENT_STATUS.READY_FOR_CHECKERS_APPROVAL)) {
      console.error("Amendment %s on facility %s is not ready for checker's approval", amendmentId, facilityId);
      return res.redirect('/not-found');
    }

    const viewModel: SubmittedForCheckingViewModel = {
      returnLink: '/dashboard/deals',
    };

    return res.render('partials/amendments/submitted-for-checking.njk', viewModel);
  } catch (error) {
    console.error('Error getting submitted for checking amendment page %o', error);
    return res.render('partials/problem-with-service.njk');
  }
};
