import { CustomExpressRequest } from '@ukef/dtfs2-common';
import { Response } from 'express';
import * as api from '../../../services/api';
import { asLoggedInUserSession } from '../../../utils/express-session';
import { PORTAL_AMENDMENT_PAGES } from '../../../constants/amendments';
import { getAmendmentsUrl } from '../helpers/navigation.helper.ts';

export type PostCreateFacilityAmendmentRequest = CustomExpressRequest<{
  params: { dealId: string; facilityId: string };
}>;

/**
 * Controller to overwrite draft amendment on facility
 * @param req - the request object
 * @param res - the response object
 */
export const postCreateDraftFacilityAmendment = async (req: PostCreateFacilityAmendmentRequest, res: Response) => {
  try {
    const { dealId, facilityId } = req.params;
    const { userToken } = asLoggedInUserSession(req.session);

    const amendment = { tfm: {} };

    const { amendmentId } = await api.upsertAmendment({ facilityId, dealId, amendment, userToken });

    return res.redirect(getAmendmentsUrl({ dealId, facilityId, amendmentId, page: PORTAL_AMENDMENT_PAGES.WHAT_DO_YOU_NEED_TO_CHANGE }));
  } catch (error) {
    console.error('Error upserting draft facility amendment %o', error);
    return res.render('partials/problem-with-service.njk');
  }
};
