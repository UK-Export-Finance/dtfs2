import { CustomExpressRequest, PORTAL_AMENDMENT_STATUS, TEAM_IDS, nowZeroSeconds } from '@ukef/dtfs2-common';
import { Response } from 'express';
import { getUnixTime } from 'date-fns';
import { validationErrorHandler } from '../../../utils/helpers';
import { asLoggedInUserSession } from '../../../utils/express-session';
import api from '../../../services/api';
import { PORTAL_AMENDMENT_PAGES } from '../../../constants/amendments';
import { getAmendmentsUrl } from '../helpers/navigation.helper';
import { getAmendmentReferenceNumber } from '../helpers/get-amendment-reference-number.helper';
import { ConfirmAmendmentSubmissionViewModel } from '../../../types/view-models/amendments/confirm-amendment-submission-view-model';
import mapSubmittedToUkefEmailVariables from '../helpers/map-submitted-to-ukef-email-variables';

export type PostSubmitAmendmentToUkefRequest = CustomExpressRequest<{
  params: { dealId: string; facilityId: string; amendmentId: string };
  reqBody: {
    confirmSubmitUkef: boolean;
  };
}>;
export const postSubmitAmendmentToUkef = async (req: PostSubmitAmendmentToUkefRequest, res: Response) => {
  try {
    const { dealId, facilityId, amendmentId } = req.params;
    const { confirmSubmitUkef } = req.body;
    const { userToken, user } = asLoggedInUserSession(req.session);

    console.info('Portal Amendent %s is being submitted to TFM', amendmentId);

    const deal = await api.getApplication({ dealId, userToken });
    const { details: facility } = await api.getFacility({ facilityId, userToken });

    if (!deal || !facility) {
      console.error('Deal %s or Facility %s was not found', dealId, facilityId);
      return res.redirect('/not-found');
    }

    const amendment = await api.getAmendment({ facilityId, amendmentId, userToken });

    if (!amendment) {
      console.error('Amendment %s was not found for the facility %s', amendmentId, facilityId);
      return res.redirect('/not-found');
    }

    if (!confirmSubmitUkef) {
      const errors = validationErrorHandler({
        errRef: 'confirmSubmitUkef',
        errMsg: 'Select that you have reviewed the information given and want to proceed with the submission',
      });

      const viewModel: ConfirmAmendmentSubmissionViewModel = {
        exporterName: deal.exporter.companyName,
        dealId,
        facilityId,
        amendmentId,
        previousPage: `/gef/application-details/${deal._id}/${PORTAL_AMENDMENT_PAGES.AMENDMENT_DETAILS}`,
        errors,
      };

      return res.render('partials/submit-to-ukef.njk', viewModel);
    }

    const referenceNumber = await getAmendmentReferenceNumber(dealId, facilityId, userToken);

    if (!referenceNumber) {
      console.error('Reference number could not be created for deal %s and facility %s', dealId, facilityId);
      return res.redirect('/not-found');
    }

    const teamId = TEAM_IDS.PIM;
    const pim = await api.getTfmTeam({ teamId, userToken });
    const { email: pimEmail } = pim;

    const { makersEmail, checkersEmail, emailVariables } = mapSubmittedToUkefEmailVariables({ deal, facility, amendment, user, referenceNumber });

    const status = PORTAL_AMENDMENT_STATUS.ACKNOWLEDGED;

    const requestDate = getUnixTime(nowZeroSeconds());

    await api.updateSubmitAmendment({
      facilityId,
      amendmentId,
      referenceNumber,
      status,
      userToken,
      makersEmail,
      checkersEmail,
      pimEmail,
      emailVariables,
      requestDate,
    });

    return res.redirect(getAmendmentsUrl({ dealId, facilityId, amendmentId, page: PORTAL_AMENDMENT_PAGES.APPROVED_BY_UKEF }));
  } catch (error) {
    console.error('Error posting submitted amendment to UKEF %o', error);
    return res.render('partials/problem-with-service.njk');
  }
};
