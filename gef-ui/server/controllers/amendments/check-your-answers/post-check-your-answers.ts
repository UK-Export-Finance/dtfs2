import { CustomExpressRequest, PORTAL_AMENDMENT_STATUS } from '@ukef/dtfs2-common';
import { Response } from 'express';
import * as api from '../../../services/api';
import { asLoggedInUserSession } from '../../../utils/express-session';
import { getNextPage } from '../helpers/navigation.helper.ts';
import { PORTAL_AMENDMENT_PAGES } from '../../../constants/amendments.ts';
import mapSubmittedToCheckerEmailVariables from '../helpers/map-submitted-to-checker-email-variables.ts';

export type PostCheckYourAnswersRequest = CustomExpressRequest<{
  params: { facilityId: string; amendmentId: string; dealId: string };
}>;

/**
 * Controller to post check your answers page & submit the amendment to checker
 * @param req - The express request
 * @param res - The express response
 */
export const postCheckYourAnswers = async (req: PostCheckYourAnswersRequest, res: Response) => {
  try {
    const { facilityId, amendmentId, dealId } = req.params;
    const { userToken, user } = asLoggedInUserSession(req.session);

    const deal = await api.getApplication({ dealId, userToken });
    const { details: facility } = await api.getFacility({ facilityId, userToken });

    const amendment = await api.getAmendment({ facilityId, amendmentId, userToken });

    if (!deal || !facility) {
      console.error('Deal %s or Facility %s was not found', dealId, facilityId);
      return res.redirect('/not-found');
    }

    if (!amendment) {
      console.error('Amendment %s was not found for the facility %s', amendmentId, facilityId);
      return res.redirect('/not-found');
    }

    const {
      sendToEmailAddress,
      recipientName,
      ukefDealId,
      exporterName,
      bankInternalRefName,
      ukefFacilityId,
      formattedCoverEndDate,
      formattedEffectiveDate,
      formattedFacilityEndDate,
      formattedFacilityValue,
    } = mapSubmittedToCheckerEmailVariables(deal, facility, amendment, user);

    const updatedAmendment = await api.updateAmendmentStatus({
      facilityId,
      amendmentId,
      newStatus: PORTAL_AMENDMENT_STATUS.READY_FOR_CHECKERS_APPROVAL,
      userToken,
      sendToEmailAddress,
      exporterName,
      bankInternalRefName: bankInternalRefName!,
      ukefDealId,
      ukefFacilityId: ukefFacilityId!,
      recipientName,
      dateEffectiveFrom: formattedEffectiveDate,
      newCoverEndDate: formattedCoverEndDate,
      newFacilityEndDate: formattedFacilityEndDate,
      newFacilityValue: formattedFacilityValue,
    });

    return res.redirect(getNextPage(PORTAL_AMENDMENT_PAGES.CHECK_YOUR_ANSWERS, updatedAmendment));
  } catch (error) {
    console.error('Error posting amendments check your answers page %o', error);
    return res.render('partials/problem-with-service.njk');
  }
};
