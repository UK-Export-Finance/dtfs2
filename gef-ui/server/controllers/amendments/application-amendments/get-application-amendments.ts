import { Response } from 'express';
import { CustomExpressRequest, PORTAL_AMENDMENT_STATUS, TFM_AMENDMENT_STATUS, isPortalFacilityAmendmentsFeatureFlagEnabled } from '@ukef/dtfs2-common';
import api from '../../../services/api';
import { asLoggedInUserSession } from '../../../utils/express-session';
import { getSubmittedAmendmentDetails } from '../../../utils/submitted-amendment-details';
import { mapApplicationAmendmentsOnDeal } from '../../../utils/map-application-amendments-on-deal';

export type GetApplicationAmendmentsRequest = CustomExpressRequest<{
  params: { dealId: string };
}>;

/**
 * controller to get application amendments page
 *
 * @param req - The express request
 * @param res - The express response
 */
export const getApplicationAmendments = async (req: GetApplicationAmendmentsRequest, res: Response) => {
  try {
    const { dealId } = req.params;
    const { userToken } = asLoggedInUserSession(req.session);

    const deal = await api.getApplication({ dealId, userToken });

    if (!deal) {
      console.error('Deal %s was not found', dealId);
      return res.redirect('/not-found');
    }

    const checker = await api.getUserDetails({ userId: deal.checkerId, userToken });

    let checkedBy;
    if (checker) {
      checkedBy = `${String(checker.firstname)} ${String(checker.surname)}`;
    }

    let createdBy;
    if (deal.maker) {
      const { maker } = deal;
      createdBy = `${String(maker.firstname)} ${String(maker.surname)}`;
    }

    const applicationAmendmentsOnDeal = await api.getAmendmentsOnDeal({
      dealId: deal._id,
      userToken,
      statuses: [PORTAL_AMENDMENT_STATUS.ACKNOWLEDGED, TFM_AMENDMENT_STATUS.COMPLETED],
    });

    if (!applicationAmendmentsOnDeal) {
      console.error('Application amendments were not found for the deal %s', dealId);
      return res.redirect('/not-found');
    }

    const getApplicationAmendmentsOnDeal = mapApplicationAmendmentsOnDeal(applicationAmendmentsOnDeal);

    const lastSubmittedPortalAmendmentDetails = await getSubmittedAmendmentDetails(deal, userToken);

    const isFeatureFlagEnabled = isPortalFacilityAmendmentsFeatureFlagEnabled();
    const viewModel = {
      isFeatureFlagEnabled,
      activeSubNavigation: 'amendments',
      dealId,
      bankInternalRefName: deal.bankInternalRefName,
      additionalRefName: deal.additionalRefName,
      ukefDealId: deal.ukefDealId,
      applicationStatus: deal.status,
      applicationType: deal.submissionType,
      submissionCount: deal.submissionCount,
      checkedBy,
      createdBy,
      companyName: deal.exporter.companyName,
      dateCreated: deal.createdAt,
      submissionDate: deal.submissionDate,
      portalAmendmentStatus: lastSubmittedPortalAmendmentDetails?.portalAmendmentStatus,
      isPortalAmendmentInProgress: lastSubmittedPortalAmendmentDetails?.isPortalAmendmentInProgress,
      applicationAmendmentsOnDeal: getApplicationAmendmentsOnDeal,
    };

    return res.render('partials/amendments/application-amendments.njk', viewModel);
  } catch (error) {
    console.error('Error getting application amendments page %o', error);
    return res.render('partials/problem-with-service.njk');
  }
};
