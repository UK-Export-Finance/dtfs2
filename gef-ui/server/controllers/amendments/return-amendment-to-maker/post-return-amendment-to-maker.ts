import { CustomExpressRequest, PORTAL_AMENDMENT_STATUS } from '@ukef/dtfs2-common';
import { Response } from 'express';
import api from '../../../services/api';
import { asLoggedInUserSession } from '../../../utils/express-session';
import { ReturnAmendmentToMakerViewModel } from '../../../types/view-models/amendments/return-amendment-to-maker-view-model';
import { PORTAL_AMENDMENT_PAGES } from '../../../constants/amendments';
import { validationErrorHandler } from '../../../utils/helpers';
import { getAmendmentsUrl } from '../helpers/navigation.helper';
import { addCheckerCommentsToApplication } from '../../../helpers/add-checker-comments-to-application';

export type PostReturnToMakerRequest = CustomExpressRequest<{
  params: { dealId: string; facilityId: string; amendmentId: string };
  reqBody: { comment: string };
}>;

export const MAX_COMMENT_LENGTH = 400;

/**
 * controller to post return amendment to maker
 *
 * @param req - The express request
 * @param res - The express response
 */
export const postReturnAmendmentToMaker = async (req: PostReturnToMakerRequest, res: Response) => {
  try {
    const { dealId, facilityId, amendmentId } = req.params;
    const { userToken, user } = asLoggedInUserSession(req.session);
    const { comment } = req.body;

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

    if (comment.length > MAX_COMMENT_LENGTH) {
      const errors = validationErrorHandler({
        errRef: 'comment',
        errMsg: `You have entered more than ${MAX_COMMENT_LENGTH} characters`,
      });

      const viewModel: ReturnAmendmentToMakerViewModel = {
        exporterName: deal.exporter.companyName,
        dealId,
        facilityId,
        amendmentId,
        facilityType: facility.type,
        previousPage: `/gef/application-details/${deal._id}/${PORTAL_AMENDMENT_PAGES.AMENDMENT_DETAILS}`,
        maxCommentLength: MAX_COMMENT_LENGTH,
        errors,
        comment,
        isReturningAmendmentToMaker: true,
      };

      return res.render('partials/return-to-maker.njk', viewModel);
    }

    await addCheckerCommentsToApplication(dealId, userToken, user._id, comment);

    await api.updateAmendmentStatus({
      facilityId,
      amendmentId,
      newStatus: PORTAL_AMENDMENT_STATUS.FURTHER_MAKERS_INPUT_REQUIRED,
      userToken,
    });

    return res.redirect(getAmendmentsUrl({ dealId, facilityId, amendmentId, page: PORTAL_AMENDMENT_PAGES.RETURNED_TO_MAKER }));
  } catch (error) {
    console.error('Error getting for submit amendment to ukef page %o', error);
    return res.render('partials/problem-with-service.njk');
  }
};
