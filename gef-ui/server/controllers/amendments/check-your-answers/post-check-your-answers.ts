import { CustomExpressRequest, PORTAL_AMENDMENT_STATUS } from '@ukef/dtfs2-common';
import { Response } from 'express';
import * as api from '../../../services/api';
import { asLoggedInUserSession } from '../../../utils/express-session';
import { getNextPage } from '../helpers/navigation.helper.ts';
import { PORTAL_AMENDMENT_PAGES } from '../../../constants/amendments.ts';

export type PostEligibilityRequest = CustomExpressRequest<{
  params: { dealId: string; facilityId: string; amendmentId: string };
}>;

/**
 * Controller to post check your answers page & submit the amendment to checker
 * @param req - The express request
 * @param res - The express response
 */
export const postCheckYourAnswers = async (req: PostEligibilityRequest, res: Response) => {
  try {
    const { facilityId, amendmentId } = req.params;
    const { userToken } = asLoggedInUserSession(req.session);

    const updatedAmendment = await api.updateAmendmentStatus({
      facilityId,
      amendmentId,
      newStatus: PORTAL_AMENDMENT_STATUS.READY_FOR_CHECKERS_APPROVAL,
      userToken,
    });

    return res.redirect(getNextPage(PORTAL_AMENDMENT_PAGES.CHECK_YOUR_ANSWERS, updatedAmendment));
  } catch (error) {
    console.error('Error posting amendments eligibility page %o', error);
    return res.render('partials/problem-with-service.njk');
  }
};
