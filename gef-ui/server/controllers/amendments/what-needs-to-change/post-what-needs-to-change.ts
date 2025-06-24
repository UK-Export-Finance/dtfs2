import { CustomExpressRequest, TEAM_IDS, PORTAL_AMENDMENT_STATUS } from '@ukef/dtfs2-common';
import { Response } from 'express';
import * as api from '../../../services/api';
import { WhatNeedsToChangeViewModel } from '../../../types/view-models/amendments/what-needs-to-change-view-model.ts';
import { asLoggedInUserSession } from '../../../utils/express-session';

import { getAmendmentsUrl, getNextPage } from '../helpers/navigation.helper.ts';
import { PORTAL_AMENDMENT_PAGES } from '../../../constants/amendments.ts';
import { validateWhatNeedsToChange } from './validation.ts';
import { validationErrorHandler } from '../../../utils/helpers';

export type PostWhatNeedsToChangeRequest = CustomExpressRequest<{
  params: { dealId: string; facilityId: string; amendmentId: string };
  reqBody: { amendmentOptions: string[] };
  query: { change?: string };
}>;

/**
 * Controller to update what needs to change on the amendment
 * @param req - The express request
 * @param res - The express response
 */
export const postWhatNeedsToChange = async (req: PostWhatNeedsToChangeRequest, res: Response) => {
  try {
    const { dealId, facilityId, amendmentId } = req.params;
    const { amendmentOptions } = req.body;
    const { userToken } = asLoggedInUserSession(req.session);

    const deal = await api.getApplication({ dealId, userToken });
    const { details: facility } = await api.getFacility({ facilityId, userToken });

    if (!deal || !facility) {
      console.error('Deal %s or Facility %s was not found', dealId, facilityId);
      return res.redirect('/not-found');
    }

    const amendment = await api.getAmendment({ facilityId, amendmentId, userToken });

    if (!amendment) {
      console.error('Amendment %s was not found for the facility %s', amendmentId, facilityId);
      return res.redirect('/not-found');
    }

    const changeCoverEndDate = amendmentOptions?.includes('changeCoverEndDate');
    const changeFacilityValue = amendmentOptions?.includes('changeFacilityValue');

    const teamId = TEAM_IDS.PIM;
    const pim = await api.getTfmTeam({ teamId, userToken });
    const { email: amendmentFormEmail } = pim;

    const validationError = validateWhatNeedsToChange({ changeCoverEndDate, changeFacilityValue });
    const canMakerCancelAmendment = amendment.status === PORTAL_AMENDMENT_STATUS.DRAFT;
    if (validationError) {
      const viewModel: WhatNeedsToChangeViewModel = {
        exporterName: deal.exporter.companyName,
        facilityType: facility.type,
        cancelUrl: getAmendmentsUrl({ dealId, facilityId, amendmentId, page: PORTAL_AMENDMENT_PAGES.CANCEL }),
        previousPage: `/gef/application-details/${dealId}`,
        amendmentFormEmail,
        changeCoverEndDate,
        changeFacilityValue,
        errors: validationErrorHandler(validationError),
        canMakerCancelAmendment,
      };

      return res.render('partials/amendments/what-needs-to-change.njk', viewModel);
    }

    const update = { changeFacilityValue, changeCoverEndDate };

    const updatedAmendment = await api.updateAmendment({
      facilityId,
      amendmentId,
      update,
      userToken,
    });

    /*
     * If change is true, then the previous page is "Check your answers"
     * If the what needs to change has changed, we need to go to the next page of the amendment journey.
     * Otherwise, the next page should be the previous page "Check your answers".
     */
    const hasUserAmendedFacility =
      amendment.changeCoverEndDate !== updatedAmendment.changeCoverEndDate || amendment.changeFacilityValue !== updatedAmendment.changeFacilityValue;

    const changeQuery = req.query?.change === 'true';
    const change = changeQuery && !hasUserAmendedFacility;
    const nextPage = getNextPage(PORTAL_AMENDMENT_PAGES.WHAT_DO_YOU_NEED_TO_CHANGE, updatedAmendment, change);

    return res.redirect(nextPage);
  } catch (error) {
    console.error('Error posting amendments what needs to change page %o', error);
    return res.render('partials/problem-with-service.njk');
  }
};
