import { CustomExpressRequest, PORTAL_AMENDMENT_STATUS } from '@ukef/dtfs2-common';
import { Response } from 'express';
import api from '../../../services/api';
import { asLoggedInUserSession } from '../../../utils/express-session';
import { ReturnedToMakerViewModel } from '../../../types/view-models/amendments/returned-to-maker-view-model';

export type GetReturnedToMakerRequest = CustomExpressRequest<{
  params: { facilityId: string; amendmentId: string };
}>;

/**
 * controller to get returned to maker page
 *
 * @param req - The express request
 * @param res - The express response
 */
export const getReturnedToMaker = async (req: GetReturnedToMakerRequest, res: Response) => {
  try {
    const { facilityId, amendmentId } = req.params;
    const { userToken } = asLoggedInUserSession(req.session);

    const amendment = await api.getAmendment({ facilityId, amendmentId, userToken });

    if (!amendment) {
      console.error('Amendment %s not found for the facility %s', amendmentId, facilityId);
      return res.redirect('/not-found');
    }

    if (amendment.status !== PORTAL_AMENDMENT_STATUS.FURTHER_MAKERS_INPUT_REQUIRED) {
      console.error(`Amendment %s on facility %s is not ${PORTAL_AMENDMENT_STATUS.FURTHER_MAKERS_INPUT_REQUIRED}`, amendmentId, facilityId);
      return res.redirect('/not-found');
    }

    const viewModel: ReturnedToMakerViewModel = {
      returnedToMaker: true,
    };

    return res.render('partials/amendments/submitted-page.njk', viewModel);
  } catch (error) {
    console.error('Error getting approval by ukef page %o', error);
    return res.render('partials/problem-with-service.njk');
  }
};
