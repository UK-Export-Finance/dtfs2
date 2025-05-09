import { CustomExpressRequest, PORTAL_AMENDMENT_INPROGRESS_STATUSES } from '@ukef/dtfs2-common';
import { Response } from 'express';
import * as api from '../../../services/api';
import { asLoggedInUserSession } from '../../../utils/express-session';
import { createAmendmentDetailsViewModel } from './create-amendment-details-view-model';

export type GetAmendmentDetailsRequest = CustomExpressRequest<{
  params: { dealId: string };
}>;

/**
 * Controller to get the `Amendment details` page
 * @param req - the request object
 * @param res - the response object
 */
export const getAmendmentDetails = async (req: GetAmendmentDetailsRequest, res: Response) => {
  try {
    const { dealId } = req.params;
    const { userToken, user } = asLoggedInUserSession(req.session);
    const userRoles = user.roles;

    const deal = await api.getApplication({ dealId, userToken });

    if (!deal) {
      console.error('Deal %s was not found', dealId);
      return res.redirect('/not-found');
    }

    /**
     * gets amendments in progress
     * will only return 1 as only 1 amendment can be in progress at a time
     */
    const amendments = await api.getPortalAmendmentsOnDeal({ dealId, statuses: PORTAL_AMENDMENT_INPROGRESS_STATUSES, userToken });

    if (!amendments?.length) {
      console.error('In progress amendment was not found for the deal %s', dealId);
      return res.redirect('/not-found');
    }

    const amendment = amendments[0];

    const { details: facility } = await api.getFacility({ facilityId: amendment.facilityId, userToken });

    if (!facility) {
      console.error('Facility %s was not found', amendment.facilityId);
      return res.redirect('/not-found');
    }

    return res.render('partials/amendments/amendment-details.njk', createAmendmentDetailsViewModel({ amendment, deal, facility, userRoles }));
  } catch (error) {
    console.error('Error getting amendments details page %o', error);
    return res.render('partials/problem-with-service.njk');
  }
};
