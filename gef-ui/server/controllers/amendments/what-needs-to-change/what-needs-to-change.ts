import { CustomExpressRequest } from '@ukef/dtfs2-common';
import { Response } from 'express';
import * as api from '../../../services/api';
import { WhatNeedsToChangeViewModel } from '../../../types/view-models/amendments/what-needs-to-change-view-model.ts';
import { asLoggedInUserSession } from '../../../utils/express-session';
import { STB_PIM_EMAIL } from '../../../constants/emails.ts';

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
    const { dealId } = req.params;
    const { userToken } = asLoggedInUserSession(req.session);

    const deal = await api.getApplication({ dealId, userToken });

    const viewModel: WhatNeedsToChangeViewModel = {
      exporterName: deal.exporter.companyName,
      previousPage: `/gef/application-details/${dealId}`,
      amendmentFormEmail: STB_PIM_EMAIL,
      // TODO: DTFS2-7685 - Pass in existing checkbox values from GET endpoint
    };

    return res.render('partials/amendments/what-needs-to-change.njk', viewModel);
  } catch (error) {
    console.error(error);
    return res.render('partials/problem-with-service.njk');
  }
};
