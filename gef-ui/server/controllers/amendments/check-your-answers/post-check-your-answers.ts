import { CustomExpressRequest, PORTAL_AMENDMENT_STATUS, PortalAmendmentSubmittedToCheckerEmailVariables } from '@ukef/dtfs2-common';
import { Response } from 'express';
import * as api from '../../../services/api';
import { asLoggedInUserSession } from '../../../utils/express-session';
import { getNextPage } from '../helpers/navigation.helper.ts';
import { PORTAL_AMENDMENT_PAGES } from '../../../constants/amendments.ts';
import mapSubmittedToCheckerEmailVariables from '../helpers/map-submitted-to-checker-email-variables.ts';
import { addExposureValuesToAmendment } from '../helpers/add-exposure-values-to-amendment.ts';

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

    const checker = await api.getUserDetails({ userId: deal.checkerId, userToken });

    if (!checker?.firstname || !checker?.surname || !checker?.email) {
      console.error('Checker %s was not found from the deal %s', deal.checkerId, dealId);
      return res.redirect('/not-found');
    }

    if (!amendment) {
      console.error('Amendment %s was not found for the facility %s', amendmentId, facilityId);
      return res.redirect('/not-found');
    }

    if (amendment.changeFacilityValue) {
      const { error, tfmUpdate: tfm } = await addExposureValuesToAmendment(amendment, facility, facilityId, userToken);

      if (error) {
        console.error('Error adding exposure values to amendment');
        return res.render('partials/problem-with-service.njk');
      }

      const update = { tfm };

      await api.updateAmendment({ facilityId, amendmentId, update, userToken });
    }

    const {
      makersName,
      makersEmail,
      checkersName,
      checkersEmail,
      dateSubmittedByMaker,
      ukefDealId,
      exporterName,
      bankInternalRefName,
      ukefFacilityId,
      newCoverEndDate,
      dateEffectiveFrom,
      newFacilityEndDate,
      newFacilityValue,
      portalUrl,
    } = mapSubmittedToCheckerEmailVariables({ deal, facility, amendment, user, checker });

    const emailVariables: PortalAmendmentSubmittedToCheckerEmailVariables = {
      exporterName,
      bankInternalRefName,
      ukefDealId,
      ukefFacilityId,
      makersName,
      checkersName,
      dateSubmittedByMaker,
      dateEffectiveFrom,
      newCoverEndDate,
      newFacilityEndDate,
      newFacilityValue,
      portalUrl,
      makersEmail,
    };

    const updatedAmendment = await api.updateAmendmentStatus({
      facilityId,
      amendmentId,
      newStatus: PORTAL_AMENDMENT_STATUS.READY_FOR_CHECKERS_APPROVAL,
      userToken,
      makersEmail,
      checkersEmail,
      emailVariables,
    });

    return res.redirect(getNextPage(PORTAL_AMENDMENT_PAGES.CHECK_YOUR_ANSWERS, updatedAmendment));
  } catch (error) {
    console.error('Error posting amendments check your answers page %o', error);
    return res.render('partials/problem-with-service.njk');
  }
};
