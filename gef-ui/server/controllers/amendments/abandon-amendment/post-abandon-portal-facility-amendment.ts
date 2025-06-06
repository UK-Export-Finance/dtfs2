import { CustomExpressRequest } from '@ukef/dtfs2-common';
import { Response } from 'express';
import * as api from '../../../services/api';
// import { PORTAL_AMENDMENT_PAGES } from '../../../constants/amendments';
// import { getAmendmentsUrl } from '../helpers/navigation.helper';
import { AbandonedViewModel } from '../../../types/view-models/amendments/abandoned-view-model';
import { asLoggedInUserSession } from '../../../utils/express-session';

export type PostAbandonPortalFacilityAmendmentRequest = CustomExpressRequest<{
  params: { dealId: string; facilityId: string; amendmentId: string };
}>;

/**
 * controller to post the abandon amendment page
 *
 * @param req - The express request
 * @param res - The express response
 */
export const postAbandonPortalFacilityAmendment = async (req: PostAbandonPortalFacilityAmendmentRequest, res: Response) => {
  try {
    const { facilityId, amendmentId } = req.params;
    const { userToken } = asLoggedInUserSession(req.session);

    await api.deleteAmendment({ facilityId, amendmentId, userToken });

    const viewModel: AbandonedViewModel = {
      abandoned: true,
    };

    return res.render('partials/amendments/submitted-page.njk', viewModel);
  } catch (error) {
    console.error('Error posting abandon amendments page %o', error);
    return res.render('partials/problem-with-service.njk');
  }
};
