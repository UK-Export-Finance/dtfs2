import { CustomExpressRequest } from '@ukef/dtfs2-common';
import { Response } from 'express';
import { isEqual } from 'lodash';
import * as api from '../../../services/api';
import { asLoggedInUserSession } from '../../../utils/express-session';
import { EligibilityReqBody, parseEligibilityResponse } from '../helpers/eligibility.helper.ts';
import { EligibilityViewModel } from '../../../types/view-models/amendments/eligibility-view-model.ts';
import { getAmendmentsUrl, getNextPage } from '../helpers/navigation.helper.ts';
import { PORTAL_AMENDMENT_PAGES } from '../../../constants/amendments.ts';
import { validationErrorHandler } from '../../../utils/helpers';
import { validateEligibilityResponse } from './validation.ts';

export type PostEligibilityRequest = CustomExpressRequest<{
  params: { dealId: string; facilityId: string; amendmentId: string };
  reqBody: EligibilityReqBody & { previousPage: string };
  query: { change?: 'true' };
}>;

/**
 * Controller to post eligibility criteria responses
 * @param req - The express request
 * @param res - The express response
 */
export const postEligibility = async (req: PostEligibilityRequest, res: Response) => {
  try {
    const { dealId, facilityId, amendmentId } = req.params;
    const { previousPage } = req.body;
    const { userToken } = asLoggedInUserSession(req.session);

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

    const {
      eligibilityCriteria: { version, criteria },
    } = amendment;

    if (!criteria) {
      console.error('Eligibility criteria was not found on amendment %s on facility %s', amendmentId, facilityId);
      return res.redirect('/not-found');
    }

    const parsedResponse = parseEligibilityResponse(req.body, criteria);

    const errorsOrValidCriteria = validateEligibilityResponse(parsedResponse);

    if ('errors' in errorsOrValidCriteria) {
      const viewModel: EligibilityViewModel = {
        exporterName: deal.exporter.companyName,
        facilityType: facility.type,
        cancelUrl: getAmendmentsUrl({ dealId, facilityId, amendmentId, page: PORTAL_AMENDMENT_PAGES.CANCEL }),
        previousPage,
        criteria: parsedResponse,
        errors: validationErrorHandler(errorsOrValidCriteria.errors),
      };

      return res.render('partials/amendments/eligibility.njk', viewModel);
    }

    const update = { eligibilityCriteria: { version, criteria: errorsOrValidCriteria.value } };

    const updatedAmendment = await api.updateAmendment({ facilityId, amendmentId, update, userToken });

    // If change is true, then the previous page is "Check your answers"
    // If the eligibility has changed, we need to go to the next page of the amendment journey.
    // Otherwise, the next page should be the previous page "Check your answers".
    const eligibilityHasChanged = !isEqual(amendment.eligibilityCriteria, updatedAmendment.eligibilityCriteria);
    const change = req.query.change === 'true' && !eligibilityHasChanged;
    const nextPage = getNextPage(PORTAL_AMENDMENT_PAGES.ELIGIBILITY, updatedAmendment, change);
    return res.redirect(nextPage);
  } catch (error) {
    console.error('Error posting amendments eligibility page %o', error);
    return res.render('partials/problem-with-service.njk');
  }
};
