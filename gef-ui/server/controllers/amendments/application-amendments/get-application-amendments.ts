import { Response } from 'express';
import { CustomExpressRequest, PortalSessionUser, PORTAL_AMENDMENT_STATUS, TFM_AMENDMENT_STATUS } from '@ukef/dtfs2-common';
import api from '../../../services/api';
import { asLoggedInUserSession } from '../../../utils/express-session';
import { getSubmittedAmendmentDetails } from '../../../utils/submitted-amendment-details';

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

    const checker = (await api.getUserDetails({ userId: deal.checkerId, userToken })) as PortalSessionUser;
    const checkedBy = `${String(checker.firstname ?? '')} ${String(checker.surname ?? '')}`;
    const createdBy = `${String(deal.maker?.firstname ?? '')} ${String(deal.maker?.surname ?? '')}`;

    const applicationAmendmentsOnDeal = await api.getAmendmentsOnDeal({
      dealId: deal._id,
      userToken,
      statuses: [PORTAL_AMENDMENT_STATUS.ACKNOWLEDGED, TFM_AMENDMENT_STATUS.COMPLETED],
    });

    if (!applicationAmendmentsOnDeal) {
      console.error('Application amendments were not found for the deal %s', dealId);
      return res.redirect('/not-found');
    }

    const amendmentDetailsInProgress = getSubmittedAmendmentDetails(deal, userToken);

    const viewModel = {
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
      portalAmendmentStatus: amendmentDetailsInProgress.portalAmendmentStatus,
      isPortalAmendmentInProgress: amendmentDetailsInProgress.isPortalAmendmentInProgress,
      applicationAmendmentsOnDeal,
    };

    return res.render('partials/amendments/application-amendments.njk', viewModel);
  } catch (error) {
    console.error('Error getting application amendments page %o', error);
    return res.render('partials/problem-with-service.njk');
  }
};
