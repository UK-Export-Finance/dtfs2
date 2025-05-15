import { CustomExpressRequest, PORTAL_AMENDMENT_INPROGRESS_STATUSES } from '@ukef/dtfs2-common';
import { fromUnixTime } from 'date-fns';
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

    let amendment;
    if (facilityId && amendmentId) {
      amendment = await api.getAmendment({ facilityId, amendmentId, userToken });

      if (!amendment) {
        console.error('Amendment %s was not found for the facility %s', amendmentId, facilityId);
        return res.redirect('/not-found');
      }
    } else {
      const amendments = await api.getPortalAmendmentsOnDeal({ dealId, statuses: PORTAL_AMENDMENT_INPROGRESS_STATUSES, userToken });
      if (!amendments) {
        console.error('In progress amendment was not found for the deal %s', dealId);
        return res.redirect('/not-found');
      }
      [amendment] = amendments;
    }

    const { details: facility } = await api.getFacility({ facilityId: amendment.facilityId, userToken });

    if (!facility) {
      console.error('Facility %s was not found', amendment.facilityId);
      return res.redirect('/not-found');
    }

    const banner = facilityId && amendmentId && new Date(fromUnixTime(amendment.effectiveDate ?? 0)) > new Date() ? true : undefined;
    return res.render('partials/amendments/amendment-details.njk', createAmendmentDetailsViewModel({ amendment, deal, facility, userRoles, banner }));
  } catch (error) {
    console.error('Error getting amendments details page %o', error);
    return res.render('partials/problem-with-service.njk');
  }
};
