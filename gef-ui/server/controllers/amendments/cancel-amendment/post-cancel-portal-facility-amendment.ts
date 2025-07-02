import { CustomExpressRequest, InvalidAmendmentStatusError, PORTAL_AMENDMENT_STATUS } from '@ukef/dtfs2-common';
import { Response } from 'express';
import * as api from '../../../services/api';
import { asLoggedInUserSession } from '../../../utils/express-session';

export type PostCancelPortalFacilityAmendmentRequest = CustomExpressRequest<{
  params: { dealId: string; facilityId: string; amendmentId: string };
}>;

/**
 * controller to post the cancel amendment page
 *
 * @param req - The express request
 * @param res - The express response
 */
export const postCancelPortalFacilityAmendment = async (req: PostCancelPortalFacilityAmendmentRequest, res: Response) => {
  try {
    const { dealId, facilityId, amendmentId } = req.params;
    const { userToken } = asLoggedInUserSession(req.session);

    const amendment = await api.getAmendment({ facilityId, amendmentId, userToken });

    if (!amendment) {
      console.error('Amendment %s was not found for the facility %s', amendmentId, facilityId);
      return res.redirect('/not-found');
    }

    if (amendment.status !== PORTAL_AMENDMENT_STATUS.DRAFT) {
      console.error(`Amendment %s on facility %s is not %s`, amendmentId, facilityId, PORTAL_AMENDMENT_STATUS.DRAFT);
      throw new InvalidAmendmentStatusError(amendment.status);
    }

    await api.deleteAmendment({
      facilityId,
      amendmentId,
      userToken,
      makersEmail: '',
      checkersEmail: '',
      emailVariables: {
        exporterName: '',
        bankInternalRefName: '',
        ukefDealId: '',
        ukefFacilityId: '',
        makersName: '',
        checkersName: '',
        dateEffectiveFrom: '',
        newCoverEndDate: '',
        newFacilityEndDate: '',
        newFacilityValue: '',
      },
    });

    return res.redirect(`/gef/application-details/${dealId}`);
  } catch (error) {
    console.error('Error posting cancel amendments page %o', error);
    return res.render('partials/problem-with-service.njk');
  }
};
