import { CustomExpressRequest, PORTAL_AMENDMENT_STATUS, RETURN_TO_MAKER_COMMENT_CHARACTER_COUNT } from '@ukef/dtfs2-common';
import { Response } from 'express';
import api from '../../../services/api';
import { asLoggedInUserSession } from '../../../utils/express-session';
import { ReturnAmendmentToMakerViewModel } from '../../../types/view-models/amendments/return-amendment-to-maker-view-model';
import { PORTAL_AMENDMENT_PAGES } from '../../../constants/amendments';
import { validationErrorHandler } from '../../../utils/helpers';
import { getAmendmentsUrl } from '../helpers/navigation.helper';
import mapReturnToMakerEmailVariables from '../helpers/map-return-to-maker-email-variables';
import { addCheckerCommentsToApplication } from '../../../helpers/add-checker-comments-to-application';

export type PostReturnToMakerRequest = CustomExpressRequest<{
  params: { dealId: string; facilityId: string; amendmentId: string };
  reqBody: { comment: string };
}>;

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

    // Trim whitespace from comment to ensure accurate character count validation
    const trimmedComment = comment?.trim() || '';

    if (trimmedComment.length > RETURN_TO_MAKER_COMMENT_CHARACTER_COUNT) {
      const errors = validationErrorHandler({
        errRef: 'comment',
        errMsg: `You have entered more than ${RETURN_TO_MAKER_COMMENT_CHARACTER_COUNT} characters`,
      });

      const exporterName = deal.exporter.companyName;
      const facilityType = facility.type;
      const previousPage = `/gef/application-details/${deal._id}/${PORTAL_AMENDMENT_PAGES.AMENDMENT_DETAILS}`;
      const maxCommentLength = RETURN_TO_MAKER_COMMENT_CHARACTER_COUNT;
      const isReturningAmendmentToMaker = true;

      const viewModel: ReturnAmendmentToMakerViewModel = {
        exporterName,
        dealId,
        facilityId,
        amendmentId,
        facilityType,
        previousPage,
        maxCommentLength,
        errors,
        comment: trimmedComment,
        isReturningAmendmentToMaker,
      };

      return res.render('partials/return-to-maker.njk', viewModel);
    }

    await addCheckerCommentsToApplication(dealId, userToken, user._id, trimmedComment);

    const { makersEmail, checkersEmail, emailVariables } = mapReturnToMakerEmailVariables({ deal, facility, amendment, user });

    await api.updateAmendmentStatus({
      facilityId,
      amendmentId,
      newStatus: PORTAL_AMENDMENT_STATUS.FURTHER_MAKERS_INPUT_REQUIRED,
      userToken,
      makersEmail,
      checkersEmail,
      emailVariables,
    });

    const url = getAmendmentsUrl({ dealId, facilityId, amendmentId, page: PORTAL_AMENDMENT_PAGES.RETURNED_TO_MAKER });

    return res.redirect(url);
  } catch (error) {
    console.error('Error posting facility amendment return to maker %o', error);
    return res.render('partials/problem-with-service.njk');
  }
};
