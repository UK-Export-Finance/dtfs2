import { CustomExpressRequest } from '@ukef/dtfs2-common';
import { Response } from 'express';
import * as api from '../../../services/api';
import { WhatNeedsToChangeViewModel } from '../../../types/view-models/amendments/what-needs-to-change-view-model.ts';
import { asLoggedInUserSession } from '../../../utils/express-session';

export type GetWhatNeedsToChangeRequest = CustomExpressRequest<{
  params: { dealId: string; facilityId: string; amendmentId: string };
}>;

export const getWhatNeedsToChange = async (req: GetWhatNeedsToChangeRequest, res: Response) => {
  try {
    const { dealId } = req.params;
    const { userToken } = asLoggedInUserSession(req.session);

    const deal = await api.getApplication({ dealId, userToken });

    const viewModel: WhatNeedsToChangeViewModel = {
      exporterName: deal.exporter.companyName,
      previousPage: `/gef/application-details/${dealId}`,
    };

    return res.render('partials/amendments/what-needs-to-change.njk', viewModel);
  } catch (error) {
    console.error(error);
    return res.render('partials/problem-with-service.njk');
  }
};
