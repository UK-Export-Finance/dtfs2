import { CustomExpressRequest, PORTAL_AMENDMENT_ASSIGNED_TO_MAKER_STATUSES } from '@ukef/dtfs2-common';
import { Response } from 'express';
import * as api from '../../../services/api';
import { DoYouHaveAFacilityEndDateViewModel } from '../../../types/view-models/amendments/do-you-have-a-facility-end-date-view-model';
import { asLoggedInUserSession } from '../../../utils/express-session';
import { userCanAmendFacility } from '../../../utils/facility-amendments.helper';
import { getAmendmentsUrl, getPreviousPage } from '../helpers/navigation.helper';
import { PORTAL_AMENDMENT_PAGES } from '../../../constants/amendments';

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

    if (!(PORTAL_AMENDMENT_ASSIGNED_TO_MAKER_STATUSES as string[]).includes(amendment.status)) {
      console.error('Amendment %s is not assigned to Maker', amendmentId);
      return res.redirect(`/gef/application-details/${dealId}`);
    }

    if (!amendment.changeCoverEndDate) {
      console.error('Amendment %s is not changing the cover end date', amendmentId);
      return res.redirect(getAmendmentsUrl({ dealId, facilityId, amendmentId, page: PORTAL_AMENDMENT_PAGES.WHAT_DO_YOU_NEED_TO_CHANGE }));
    }

    const isUsingFacilityEndDate =
      amendment.isUsingFacilityEndDate === undefined || amendment.isUsingFacilityEndDate === null ? undefined : amendment.isUsingFacilityEndDate.toString();

    const viewModel: DoYouHaveAFacilityEndDateViewModel = {
      exporterName: deal.exporter.companyName,
      facilityType: facility.type,
      cancelUrl: getAmendmentsUrl({ dealId, facilityId, amendmentId, page: PORTAL_AMENDMENT_PAGES.CANCEL }),
      previousPage: getPreviousPage(PORTAL_AMENDMENT_PAGES.DO_YOU_HAVE_A_FACILITY_END_DATE, amendment),
      isUsingFacilityEndDate,
    };

    return res.render('partials/amendments/do-you-have-a-facility-end-date.njk', viewModel);
  } catch (error) {
    console.error('Error getting amendments do you have a facility end date page %o', error);
    return res.render('partials/problem-with-service.njk');
  }
};
