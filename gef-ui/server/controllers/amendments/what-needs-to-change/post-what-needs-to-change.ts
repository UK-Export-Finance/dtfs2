import { CustomExpressRequest } from '@ukef/dtfs2-common';
import { Response } from 'express';
import * as api from '../../../services/api';
import { WhatNeedsToChangeViewModel } from '../../../types/view-models/amendments/what-needs-to-change-view-model.ts';
import { asLoggedInUserSession } from '../../../utils/express-session';
import { STB_PIM_EMAIL } from '../../../constants/emails.ts';
import { getAmendmentsUrl, getNextPage } from '../helpers/navigation.helper.ts';
import { PORTAL_AMENDMENT_PAGES } from '../../../constants/amendments.ts';
import { validateWhatNeedsToChange } from './validation.ts';
import { validationErrorHandler } from '../../../utils/helpers';

export type PostWhatNeedsToChangeRequest = CustomExpressRequest<{
  params: { dealId: string; facilityId: string; amendmentId: string };
  reqBody: { amendmentOptions: string[] };
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

    const changeCoverEndDate = amendmentOptions?.includes('changeCoverEndDate');
    const changeFacilityValue = amendmentOptions?.includes('changeFacilityValue');

    const validationError = validateWhatNeedsToChange({ changeCoverEndDate, changeFacilityValue });

    if (validationError) {
      const viewModel: WhatNeedsToChangeViewModel = {
        exporterName: deal.exporter.companyName,
        cancelUrl: getAmendmentsUrl({ dealId, facilityId, amendmentId, page: PORTAL_AMENDMENT_PAGES.CANCEL }),
        previousPage: `/gef/application-details/${dealId}`,
        amendmentFormEmail: STB_PIM_EMAIL,
        changeCoverEndDate,
        changeFacilityValue,
        errors: validationErrorHandler(validationError),
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

    return res.redirect(getNextPage(PORTAL_AMENDMENT_PAGES.WHAT_DO_YOU_NEED_TO_CHANGE, updatedAmendment));
  } catch (error) {
    console.error('Error posting amendments what needs to change page %o', error);
    return res.render('partials/problem-with-service.njk');
  }
};
