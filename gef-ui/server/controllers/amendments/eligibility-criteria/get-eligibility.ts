import { CustomExpressRequest, PORTAL_AMENDMENT_ASSIGNED_TO_MAKER_STATUSES } from '@ukef/dtfs2-common';
import { Response } from 'express';
import * as api from '../../../services/api';
import { asLoggedInUserSession } from '../../../utils/express-session';
import { userCanAmendFacility } from '../../../utils/facility-amendments.helper';
import { getAmendmentsUrl, getPreviousPage } from '../helpers/navigation.helper';
import { PORTAL_AMENDMENT_PAGES } from '../../../constants/amendments';
import { EligibilityViewModel } from '../../../types/view-models/amendments/eligibility-view-model.ts';

export type GetEligibilityRequest = CustomExpressRequest<{
  params: { dealId: string; facilityId: string; amendmentId: string };
  query: { change?: 'true' };
}>;

/**
 * Controller to get the `Eligibility` page
 * @param req - the request object
 * @param res - the response object
 */
export const getEligibility = async (req: GetEligibilityRequest, res: Response) => {
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

    const { criteria } = amendment.eligibilityCriteria;

    const viewModel: EligibilityViewModel = {
      exporterName: deal.exporter.companyName,
      facilityType: facility.type,
      cancelUrl: getAmendmentsUrl({ dealId, facilityId, amendmentId, page: PORTAL_AMENDMENT_PAGES.CANCEL }),
      previousPage: getPreviousPage(PORTAL_AMENDMENT_PAGES.ELIGIBILITY, amendment, req.query.change === 'true'),
      criteria,
    };

    return res.render('partials/amendments/eligibility.njk', viewModel);
  } catch (error) {
    console.error('Error getting amendments eligibility page %o', error);
    return res.render('partials/problem-with-service.njk');
  }
};
