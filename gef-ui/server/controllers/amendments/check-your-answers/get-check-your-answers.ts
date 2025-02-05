import { CustomExpressRequest } from '@ukef/dtfs2-common';
import { Response } from 'express';
import * as api from '../../../services/api';
import { asLoggedInUserSession } from '../../../utils/express-session';
import { userCanAmendFacility } from '../../../utils/facility-amendments.helper';
import { createCheckYourAnswersViewModel } from '../helpers/create-check-your-answers-view-model';

export type GetCheckYourAnswersRequest = CustomExpressRequest<{
  params: { dealId: string; facilityId: string; amendmentId: string };
}>;

/**
 * Controller to get the `Check your answers` page
 * @param req - the request object
 * @param res - the response object
 */
export const getCheckYourAnswers = async (req: GetCheckYourAnswersRequest, res: Response) => {
  try {
    const { dealId, facilityId, amendmentId } = req.params;
    const { userToken, user } = asLoggedInUserSession(req.session);

    const deal = await api.getApplication({ dealId, userToken });
    const { details: facility } = await api.getFacility({ facilityId, userToken });

    if (!deal || !facility) {
      console.error('Deal %s or Facility %s was not found', dealId, facilityId);
      return res.redirect('/not-found');
    }

    if (!userCanAmendFacility(facility, deal, user.roles)) {
      console.error('User cannot amend facility %s on deal %s', facilityId, dealId);
      return res.redirect(`/gef/application-details/${dealId}`);
    }

    const amendment = await api.getAmendment({ facilityId, amendmentId, userToken });

    if (!amendment) {
      console.error('Amendment %s was not found on facility %s', amendmentId, facilityId);
      return res.redirect('/not-found');
    }

    return res.render('partials/amendments/check-your-answers.njk', createCheckYourAnswersViewModel({ amendment, facility, deal }));
  } catch (error) {
    console.error('Error getting amendments check your answers page %o', error);
    return res.render('partials/problem-with-service.njk');
  }
};
