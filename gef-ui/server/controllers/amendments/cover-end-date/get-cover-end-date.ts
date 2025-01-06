import { CustomExpressRequest } from '@ukef/dtfs2-common';
import { Response } from 'express';
import * as api from '../../../services/api';
import { CoverEndDateViewModel } from '../../../types/view-models/amendments/cover-end-date-view-model';
import { asLoggedInUserSession } from '../../../utils/express-session';
import { userCanAmendFacility } from '../../../utils/facility-amendments.helper';
import { getPreviousPage } from '../helpers/navigation.helper';
import { PORTAL_AMENDMENT_PAGES } from '../../../constants/amendments';

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
      console.error('Get cover end date failed, due to missing data');
      return res.redirect('/not-found');
    }

    if (!userCanAmendFacility(facility, deal, user.roles)) {
      console.error('Authorisation failure, getting cover end date failed.');
      return res.redirect(`/gef/application-details/${dealId}`);
    }

    const amendment = await api.getAmendment({ facilityId, amendmentId, userToken });

    if (!amendment) {
      console.error('Amendment %s not found on facility %s', amendmentId, facilityId);
      return res.redirect('/not-found');
    }

    if (!amendment.changeCoverEndDate) {
      console.error(`Amendment ${amendmentId} not changing cover end date`);
      return res.redirect(
        `/gef/application-details/${dealId}/facilities/${facilityId}/amendments/${amendmentId}/${PORTAL_AMENDMENT_PAGES.WHAT_DO_YOU_NEED_TO_CHANGE}`,
      );
    }

    const viewModel: CoverEndDateViewModel = {
      exporterName: deal.exporter.companyName,
      cancelUrl: `/gef/application-details/${dealId}/facilities/${facilityId}/amendments/${amendmentId}/cancel`,
      previousPage: getPreviousPage(PORTAL_AMENDMENT_PAGES.COVER_END_DATE, amendment),
    };

    return res.render('partials/amendments/cover-end-date.njk', viewModel);
  } catch (error) {
    console.error('Error getting amendments cover end date page %o', error);
    return res.render('partials/problem-with-service.njk');
  }
};
