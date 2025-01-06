import { CustomExpressRequest } from '@ukef/dtfs2-common';
import { Response } from 'express';
import * as api from '../../../services/api';
import { DoYouHaveAFacilityEndDateViewModel } from '../../../types/view-models/amendments/do-you-have-a-facility-end-date-view-model';
import { asLoggedInUserSession } from '../../../utils/express-session';
import { userCanAmendFacility } from '../../../utils/facility-amendments.helper';

export type GetDoYouHaveAFacilityEndDateRequest = CustomExpressRequest<{
  params: { dealId: string; facilityId: string; amendmentId: string };
}>;

/**
 * Controller to get the `Do you have a facility end date` page
 * @param req - the request object
 * @param res - the response object
 */
export const getDoYouHaveAFacilityEndDate = async (req: GetDoYouHaveAFacilityEndDateRequest, res: Response) => {
  try {
    const { dealId, facilityId, amendmentId } = req.params;
    const { userToken, user } = asLoggedInUserSession(req.session);

    const deal = await api.getApplication({ dealId, userToken });
    const { details: facility } = await api.getFacility({ facilityId, userToken });

    if (!deal || !facility) {
      console.error(`Deal ${dealId} or Facility ${facilityId} not found`);
      return res.redirect('/not-found');
    }

    if (!userCanAmendFacility(facility, deal, user.roles)) {
      console.error(`User cannot amend facility ${facilityId} on deal ${dealId}`);
      return res.redirect(`/gef/application-details/${dealId}`);
    }

    const viewModel: DoYouHaveAFacilityEndDateViewModel = {
      exporterName: deal.exporter.companyName,
      cancelUrl: `/gef/application-details/${dealId}/facility/${facilityId}/amendments/${amendmentId}/cancel`,
      previousPage: `/gef/application-details/${dealId}/facility/${facilityId}/amendments/${amendmentId}/new-cover-end-date`,
    };

    return res.render('partials/amendments/do-you-have-a-facility-end-date.njk', viewModel);
  } catch (error) {
    console.error('Error getting amendments do you have a facility end date page %o', error);
    return res.render('partials/problem-with-service.njk');
  }
};
