import { CustomExpressRequest, PORTAL_AMENDMENT_STATUS } from '@ukef/dtfs2-common';
import { Response } from 'express';
import api from '../../../services/api';
import { asLoggedInUserSession } from '../../../utils/express-session';
import { ReturnAmendmentToMakerViewModel } from '../../../types/view-models/amendments/return-amendment-to-maker-view-model';
import { PORTAL_AMENDMENT_PAGES } from '../../../constants/amendments';

export type GetReturnToMakerRequest = CustomExpressRequest<{
  params: { dealId: string; facilityId: string; amendmentId: string };
}>;

export const MAX_COMMENT_LENGTH = 400;

/**
 * controller to get the return amendment to maker page
 *
 * @param req - The express request
 * @param res - The express response
 */
export const getReturnAmendmentToMaker = async (req: GetReturnToMakerRequest, res: Response) => {
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
      console.error(`Amendment %s on facility %s is not ${PORTAL_AMENDMENT_STATUS.READY_FOR_CHECKERS_APPROVAL}`, amendmentId, facilityId);
      return res.redirect('/not-found');
    }

    const viewModel: ReturnAmendmentToMakerViewModel = {
      exporterName: deal.exporter.companyName,
      dealId,
      facilityId,
      amendmentId,
      facilityType: facility.type,
      previousPage: `/gef/application-details/${deal._id}/${PORTAL_AMENDMENT_PAGES.AMENDMENT_DETAILS}`,
      maxCommentLength: MAX_COMMENT_LENGTH,
      isReturningAmendmentToMaker: true,
    };

    return res.render('partials/return-to-maker.njk', viewModel);
  } catch (error) {
    console.error('Error getting for submit amendment to ukef page %o', error);
    return res.render('partials/problem-with-service.njk');
  }
};
