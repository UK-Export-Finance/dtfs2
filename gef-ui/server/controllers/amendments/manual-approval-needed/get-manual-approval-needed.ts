import { CustomExpressRequest, PORTAL_AMENDMENT_ASSIGNED_TO_MAKER_STATUSES, TEAM_IDS } from '@ukef/dtfs2-common';
import { Response } from 'express';
import * as api from '../../../services/api';
import { asLoggedInUserSession } from '../../../utils/express-session';
import { userCanAmendFacility } from '../../../utils/facility-amendments.helper';
import { getAmendmentsUrl, getPreviousPage } from '../helpers/navigation.helper.ts';
import { PORTAL_AMENDMENT_PAGES } from '../../../constants/amendments.ts';
import { ManualApprovalNeededViewModel } from '../../../types/view-models/amendments/ManualApprovalNeededViewModel.ts';

export type GetManualApprovalNeededRequest = CustomExpressRequest<{
  params: { dealId: string; facilityId: string; amendmentId: string };
}>;

/**
 * controller to get the manual approval needed amendment page
 *
 * @param req - The express request
 * @param res - The express response
 */
export const getManualApprovalNeeded = async (req: GetManualApprovalNeededRequest, res: Response) => {
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

    if (!amendment.eligibilityCriteria.criteria.some((criterion) => criterion.answer === false)) {
      console.error('There are no false answers to the eligibility criteria, manual approval not necessarily required', amendmentId, facilityId);
      return res.redirect(getAmendmentsUrl({ dealId, facilityId, amendmentId, page: PORTAL_AMENDMENT_PAGES.ELIGIBILITY }));
    }

    const teamId = TEAM_IDS.PIM;
    const pim = await api.getTfmTeam({ teamId, userToken });
    const { email: amendmentFormEmail } = pim;

    const viewModel: ManualApprovalNeededViewModel = {
      exporterName: deal.exporter.companyName,
      facilityType: facility.type,
      previousPage: getPreviousPage(PORTAL_AMENDMENT_PAGES.MANUAL_APPROVAL_NEEDED, amendment),
      amendmentFormEmail,
      returnLink: '/dashboard/deals',
    };

    return res.render('partials/amendments/manual-approval-needed.njk', viewModel);
  } catch (error) {
    console.error('Error getting manual approval needed amendment page %o', error);
    return res.render('partials/problem-with-service.njk');
  }
};
