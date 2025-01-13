import { CustomExpressRequest } from '@ukef/dtfs2-common';
import { Response } from 'express';
import * as api from '../../../services/api';
import { CancelAmendmentViewModel } from '../../../types/view-models/amendments/cancel-amendment-view-model';
import { asLoggedInUserSession } from '../../../utils/express-session';
import { userCanAmendFacility } from '../../../utils/facility-amendments.helper';
import { getPreviousAmendmentPageUrl } from './get-previous-page-url';

export type GetCancelPortalFacilityAmendmentRequest = CustomExpressRequest<{
  params: { dealId: string; facilityId: string; amendmentId: string };
}>;

/**
 * controller to get the cancel amendment page
 *
 * @param req - The express request
 * @param res - The express response
 */
export const getCancelPortalFacilityAmendment = async (req: GetCancelPortalFacilityAmendmentRequest, res: Response) => {
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

    const previousPage = getPreviousAmendmentPageUrl(req.headers.referer, dealId, facilityId, amendmentId);

    const viewModel: CancelAmendmentViewModel = {
      exporterName: deal.exporter.companyName,
      previousPage,
    };

    return res.render('partials/amendments/cancel.njk', viewModel);
  } catch (error) {
    console.error('Error getting cancel portal facility amendment page %o', error);
    return res.render('partials/problem-with-service.njk');
  }
};
