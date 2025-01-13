import { CustomExpressRequest } from '@ukef/dtfs2-common';
import { Response } from 'express';
import * as api from '../../../services/api';
import { WhatNeedsToChangeViewModel } from '../../../types/view-models/amendments/what-needs-to-change-view-model.ts';
import { asLoggedInUserSession } from '../../../utils/express-session';
import { STB_PIM_EMAIL } from '../../../constants/emails.ts';
import { userCanAmendFacility } from '../../../utils/facility-amendments.helper.ts';

export type GetWhatNeedsToChangeRequest = CustomExpressRequest<{
  params: { dealId: string; facilityId: string; amendmentId: string };
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
      console.error('Amendment %s not found on facility %s', amendmentId, facilityId);
      return res.redirect('/not-found');
    }

    const { changeCoverEndDate, changeFacilityValue } = amendment;

    const viewModel: WhatNeedsToChangeViewModel = {
      exporterName: deal.exporter.companyName,
      previousPage: `/gef/application-details/${dealId}`,
      amendmentFormEmail: STB_PIM_EMAIL,
      changeCoverEndDate,
      changeFacilityValue,
    };

    return res.render('partials/amendments/what-needs-to-change.njk', viewModel);
  } catch (error) {
    console.error('Error getting amendments what needs to change page %o', error);
    return res.render('partials/problem-with-service.njk');
  }
};
