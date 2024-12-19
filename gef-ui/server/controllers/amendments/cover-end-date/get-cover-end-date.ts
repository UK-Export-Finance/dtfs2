import { CustomExpressRequest } from '@ukef/dtfs2-common';
import { Response } from 'express';
import * as api from '../../../services/api';
import { CoverEndDateViewModel } from '../../../types/view-models/amendments/cover-end-date-view-model';
import { asLoggedInUserSession } from '../../../utils/express-session';
import { userCanAmendFacility } from '../../../utils/facility-amendments.helper';

export type GetCoverEndDateRequest = CustomExpressRequest<{
  params: { dealId: string; facilityId: string; amendmentId: string };
}>;

/**
 * Renders the new cover end date view based on the provided request parameters
 * @param {GetCoverEndDateRequest} Request object
 * @param {Response} Response used to render the cover end date view
 * @returns {void} Renders the 'partials/amendments/cover-end-date.njk' template
 * or an error if rendering fails
 */
export const getCoverEndDate = async (req: GetCoverEndDateRequest, res: Response) => {
  try {
    const { dealId, facilityId, amendmentId } = req.params;
    const { userToken, user } = asLoggedInUserSession(req.session);

    const deal = await api.getApplication({ dealId, userToken });
    const { details: facility } = await api.getFacility({ facilityId, userToken });

    if (!deal || !facility) {
      console.error('Missing required data: %o', { deal, facility });
      return res.redirect('/not-found');
    }

    if (!userCanAmendFacility(facility, deal, user.roles)) {
      console.error('Permission denied. User cannot ammend facility');
      return res.redirect(`/gef/application-details/${dealId}`);
    }

    const viewModel: CoverEndDateViewModel = {
      exporterName: deal.exporter.companyName,
      cancelUrl: `/gef/application-details/${dealId}/facility/${facilityId}/amendments/${amendmentId}/cancel`,
      previousPage: `/gef/application-details/${dealId}/facility/${facilityId}/amendments/${amendmentId}/what-needs-to-change`,
    };

    return res.render('partials/amendments/cover-end-date.njk', viewModel);
  } catch (error) {
    console.error('Error getting amendments cover end date page %o', error);
    return res.render('partials/problem-with-service.njk');
  }
};
