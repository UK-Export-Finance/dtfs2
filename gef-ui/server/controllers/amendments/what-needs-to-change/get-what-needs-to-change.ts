import { CustomExpressRequest, PORTAL_AMENDMENT_ASSIGNED_TO_MAKER_STATUSES, TEAM_IDS } from '@ukef/dtfs2-common';
import { Response } from 'express';
import * as api from '../../../services/api';
import { WhatNeedsToChangeViewModel } from '../../../types/view-models/amendments/what-needs-to-change-view-model.ts';
import { asLoggedInUserSession } from '../../../utils/express-session';

import { userCanAmendFacility } from '../../../utils/facility-amendments.helper.ts';
import { getAmendmentsUrl } from '../helpers/navigation.helper.ts';
import { PORTAL_AMENDMENT_PAGES } from '../../../constants/amendments.ts';

export type GetWhatNeedsToChangeRequest = CustomExpressRequest<{
  params: { dealId: string; facilityId: string; amendmentId: string };
  query: { change?: string };
}>;

/**
 * Controller to get the `What needs to change` page
 * @param req - the request object
 * @param res - the response object
 */
export const getWhatNeedsToChange = async (req: GetWhatNeedsToChangeRequest, res: Response) => {
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

    const { changeCoverEndDate, changeFacilityValue } = amendment;
    const changeQuery = req.query?.change === 'true';

    const teamId = TEAM_IDS.PIM;
    const pim = await api.getTfmTeam({ teamId, userToken });
    const { email: amendmentFormEmail } = pim;

    const viewModel: WhatNeedsToChangeViewModel = {
      exporterName: deal.exporter.companyName,
      facilityType: facility.type,
      cancelUrl: getAmendmentsUrl({ dealId, facilityId, amendmentId, page: PORTAL_AMENDMENT_PAGES.CANCEL }),
      previousPage: changeQuery
        ? getAmendmentsUrl({ dealId, facilityId, amendmentId, page: PORTAL_AMENDMENT_PAGES.CHECK_YOUR_ANSWERS })
        : `/gef/application-details/${dealId}`,
      amendmentFormEmail,
      changeCoverEndDate,
      changeFacilityValue,
    };

    return res.render('partials/amendments/what-needs-to-change.njk', viewModel);
  } catch (error) {
    console.error('Error getting amendments what needs to change page %o', error);
    return res.render('partials/problem-with-service.njk');
  }
};
