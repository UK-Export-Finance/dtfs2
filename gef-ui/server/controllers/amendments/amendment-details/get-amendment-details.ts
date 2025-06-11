import { CustomExpressRequest, PORTAL_AMENDMENT_STATUS } from '@ukef/dtfs2-common';
import { fromUnixTime } from 'date-fns';
import { Response } from 'express';
import * as api from '../../../services/api';
import { asLoggedInUserSession } from '../../../utils/express-session';
import { createAmendmentDetailsViewModel } from './create-amendment-details-view-model';

export type GetAmendmentDetailsRequest = CustomExpressRequest<{
  params: { dealId: string; facilityId: string; amendmentId: string };
}>;

/**
 * Controller to get the `Amendment details` page
 * @param req - the request object
 * @param res - the response object
 */
export const getAmendmentDetails = async (req: GetAmendmentDetailsRequest, res: Response) => {
  try {
    const { dealId, amendmentId, facilityId } = req.params;
    const { userToken, user } = asLoggedInUserSession(req.session);
    const userRoles = user.roles;

    const deal = await api.getApplication({ dealId, userToken });

    if (!deal) {
      console.error('Deal %s was not found', dealId);
      return res.redirect('/not-found');
    }

    /**
     * gets amendments in progress
     * will only return one as only one amendment can be in progress at a time per facility.
     */
    const amendment = await api.getAmendment({ amendmentId, facilityId, userToken });

    if (!amendment) {
      console.error('Amendment was not found for the provided amendment id %s and facility id %s', amendmentId, facilityId);
      return res.redirect('/not-found');
    }

    const { details: facility } = await api.getFacility({ facilityId, userToken });

    if (!facility) {
      console.error('Facility %s was not found', amendment.facilityId);
      return res.redirect('/not-found');
    }

    let banner;

    const effectiveDate = amendment.effectiveDate ? fromUnixTime(amendment.effectiveDate) : null;
    const isEffectiveDateInFuture = effectiveDate && new Date(effectiveDate) > new Date();
    const amendmentIsAcknowledged = amendment.status === PORTAL_AMENDMENT_STATUS.ACKNOWLEDGED;

    if (isEffectiveDateInFuture && amendmentIsAcknowledged) {
      banner = true;
    }

    return res.render('partials/amendments/amendment-details.njk', createAmendmentDetailsViewModel({ amendment, deal, facility, userRoles, banner }));
  } catch (error) {
    console.error('Error getting amendments details page %o', error);
    return res.render('partials/problem-with-service.njk');
  }
};
