import { CustomExpressRequest, PORTAL_AMENDMENT_STATUS } from '@ukef/dtfs2-common';
import { Response } from 'express';
import api from '../../../services/api';
import { asLoggedInUserSession } from '../../../utils/express-session';
import { ConfirmAmendmentSubmissionViewModel } from '../../../types/view-models/amendments/confirm-amendment-submission-view-model';
import { PORTAL_AMENDMENT_PAGES } from '../../../constants/amendments';

export type GetSubmitAmendmentToUkefRequest = CustomExpressRequest<{
  params: { dealId: string; facilityId: string; amendmentId: string };
}>;

/**
 * controller to get the submit to ukef confirmation page
 *
 * @param req - The express request
 * @param res - The express response
 */
export const getSubmitAmendmentToUkef = async (req: GetSubmitAmendmentToUkefRequest, res: Response) => {
  try {
    const { dealId, facilityId, amendmentId } = req.params;
    const { userToken } = asLoggedInUserSession(req.session);

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

    if (amendment.status !== PORTAL_AMENDMENT_STATUS.READY_FOR_CHECKERS_APPROVAL) {
      console.error("Amendment %s on facility %s is not ready for checker's approval", amendmentId, facilityId);
      return res.redirect('/not-found');
    }

    const viewModel: ConfirmAmendmentSubmissionViewModel = {
      exporterName: deal.exporter.companyName,
      dealId,
      facilityId,
      amendmentId,
      previousPage: `/gef/application-details/${deal._id}/${PORTAL_AMENDMENT_PAGES.AMENDMENT_DETAILS}`,
    };

    return res.render('partials/submit-to-ukef.njk', viewModel);
  } catch (error) {
    console.error('Error getting for submit amendment to ukef page %o', error);
    return res.render('partials/problem-with-service.njk');
  }
};
