import { CustomExpressRequest, PORTAL_AMENDMENT_ASSIGNED_TO_MAKER_STATUSES } from '@ukef/dtfs2-common';
import { Response } from 'express';
import * as api from '../../../services/api';
import { AbandonAmendmentViewModel } from '../../../types/view-models/amendments/abandon-amendment-view-model';
import { asLoggedInUserSession } from '../../../utils/express-session';
import { userCanAmendFacility } from '../../../utils/facility-amendments.helper';

export type GetAbandonPortalFacilityAmendmentRequest = CustomExpressRequest<{
  params: { dealId: string; facilityId: string; amendmentId: string };
}>;

/**
 * controller to get the abandon amendment page
 *
 * @param req - The express request
 * @param res - The express response
 */
export const getAbandonPortalFacilityAmendment = async (req: GetAbandonPortalFacilityAmendmentRequest, res: Response) => {
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
      console.error('Amendment %s was not found for the facility %s', amendmentId, facilityId);
      return res.redirect('/not-found');
    }

    const amendmentAssignedToMaker = PORTAL_AMENDMENT_ASSIGNED_TO_MAKER_STATUSES.map(String).includes(amendment.status);

    if (!amendmentAssignedToMaker) {
      console.error('Amendment %s is not assigned to Maker', amendmentId);
      return res.redirect(`/gef/application-details/${dealId}`);
    }

    const previousPage = req.headers.referer ?? `/gef/application-details/${dealId}`;
    const applicationDetailsUrl = `/gef/application-details/${dealId}`;
    const exporterName = deal.exporter.companyName;
    const facilityType = facility.type;

    const viewModel: AbandonAmendmentViewModel = {
      exporterName,
      facilityType,
      previousPage,
      applicationDetailsUrl,
    };

    return res.render('partials/amendments/abandon.njk', viewModel);
  } catch (error) {
    console.error('Error getting abandon portal facility amendment page %o', error);
    return res.render('partials/problem-with-service.njk');
  }
};
