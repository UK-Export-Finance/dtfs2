import { CustomExpressRequest, PORTAL_AMENDMENT_INPROGRESS_STATUSES } from '@ukef/dtfs2-common';
import { Response } from 'express';
import * as api from '../../../services/api';
import { asLoggedInUserSession } from '../../../utils/express-session';
import { createAmendmentDetailsViewModel } from './create-amendment-details-view-model';

export type GetAmendmentDetailsRequest = CustomExpressRequest<{
  params: { dealId: string };
  query: { amendmentId?: string; facilityId?: string };
}>;

/**
 * Controller to get the `Amendment details` page
 * @param req - the request object
 * @param res - the response object
 */
export const getAmendmentDetails = async (req: GetAmendmentDetailsRequest, res: Response) => {
  try {
    const { dealId } = req.params;
    const { facilityId, amendmentId } = req.query;
    const { userToken, user } = asLoggedInUserSession(req.session);
    const userRoles = user.roles;

    const deal = await api.getApplication({ dealId, userToken });

    if (!deal) {
      console.error('Deal %s was not found', dealId);
      return res.redirect('/not-found');
    }

    const amendment =
      facilityId && amendmentId
        ? await api.getAmendment({ facilityId, amendmentId, userToken })
        : (await api.getPortalAmendmentsOnDeal({ dealId, statuses: PORTAL_AMENDMENT_INPROGRESS_STATUSES, userToken }))?.[0];

    if (!amendment) {
      console.error(
        facilityId && amendmentId ? 'Amendment %s was not found for the facility %s' : 'In progress amendment was not found for the deal %s',
        facilityId && amendmentId ? amendmentId : dealId,
        facilityId,
      );
      return res.redirect('/not-found');
    }

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
