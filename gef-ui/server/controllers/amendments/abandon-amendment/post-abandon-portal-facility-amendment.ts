import { CustomExpressRequest } from '@ukef/dtfs2-common';
import { Response } from 'express';
import * as api from '../../../services/api';
import { AbandonedViewModel } from '../../../types/view-models/amendments/abandoned-view-model';
import { asLoggedInUserSession } from '../../../utils/express-session';
import mapAbandonAmendmentEmailVariables from '../helpers/map-abandon-amendment-email-variables';

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
    const { dealId, facilityId, amendmentId } = req.params;
    const { userToken, user } = asLoggedInUserSession(req.session);

    const deal = await api.getApplication({ dealId, userToken });
    const { details: facility } = await api.getFacility({ facilityId, userToken });

    if (!deal || !facility) {
      console.error('Deal %s or Facility %s was not found', dealId, facilityId);
      return res.redirect('/not-found');
    }

    const amendment = await api.getAmendment({ facilityId, amendmentId, userToken });

    if (!amendment) {
      console.error('Amendment %s not found for the facility %s', amendmentId, facilityId);
      return res.redirect('/not-found');
    }

    const { makersEmail, checkersEmail, emailVariables } = mapAbandonAmendmentEmailVariables({ deal, facility, amendment, user });

    await api.deleteAmendment({ facilityId, amendmentId, userToken, makersEmail, checkersEmail, emailVariables });

    const viewModel: AbandonedViewModel = {
      abandoned: true,
    };

    return res.render('partials/amendments/submitted-page.njk', viewModel);
  } catch (error) {
    console.error('Error posting to facility amendment abandonment page %o', error);
    return res.render('partials/problem-with-service.njk');
  }
};
