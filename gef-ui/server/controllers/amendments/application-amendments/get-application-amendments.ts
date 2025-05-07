import { Response } from 'express';
import { CustomExpressRequest, PortalSessionUser } from '@ukef/dtfs2-common';
import api from '../../../services/api';
import { asLoggedInUserSession } from '../../../utils/express-session';
import { getApplicationAmendmentsHelper } from '../../../utils/get-application-amendments.helper';

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

    const applicationAmendmentsOnDeal = await getApplicationAmendmentsHelper(deal, userToken);

    if (!applicationAmendmentsOnDeal) {
      console.error('Application amendments were not found for the deal %s', dealId);
      return res.redirect('/not-found');
    }

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
      portalAmendmentStatus: applicationAmendmentsOnDeal.portalAmendmentStatus,
      isPortalAmendmentInProgress: applicationAmendmentsOnDeal.isPortalAmendmentInProgress,
      applicationAmendmentsOnDeal: applicationAmendmentsOnDeal.amendments,
    };

    return res.render('partials/amendments/application-amendments.njk', viewModel);
  } catch (error) {
    console.error('Error getting application amendments page %o', error);
    return res.render('partials/problem-with-service.njk');
  }
};
