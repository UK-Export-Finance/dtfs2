import { CustomExpressRequest, PORTAL_AMENDMENT_STATUS, AmendmentNotFoundError } from '@ukef/dtfs2-common';
import { Response } from 'express';
import * as api from '../../../services/api';
import { DoYouHaveAFacilityEndDateViewModel } from '../../../types/view-models/amendments/do-you-have-a-facility-end-date-view-model';
import { asLoggedInUserSession } from '../../../utils/express-session';
import { getAmendmentsUrl, getNextPage } from '../helpers/navigation.helper';
import { PORTAL_AMENDMENT_PAGES } from '../../../constants/amendments';
import { validateIsUsingFacilityEndDate } from './validation';
import { validationErrorHandler } from '../../../utils/helpers';

export type PostDoYouHaveAFacilityEndDateRequest = CustomExpressRequest<{
  params: { dealId: string; facilityId: string; amendmentId: string };
  reqBody: { isUsingFacilityEndDate: string | undefined; previousPage: string };
}>;

/**
 * Controller to update the isUsingFacilityEndDate value
 * @param req - the request object
 * @param res - the response object
 */
export const postDoYouHaveAFacilityEndDate = async (req: PostDoYouHaveAFacilityEndDateRequest, res: Response) => {
  try {
    const { dealId, facilityId, amendmentId } = req.params;
    const { isUsingFacilityEndDate, previousPage } = req.body;
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

    const errorsOrValue = validateIsUsingFacilityEndDate(isUsingFacilityEndDate);
    const canMakerCancelAmendment = amendment.status === PORTAL_AMENDMENT_STATUS.DRAFT;

    if ('errors' in errorsOrValue) {
      const viewModel: DoYouHaveAFacilityEndDateViewModel = {
        exporterName: deal.exporter.companyName,
        facilityType: facility.type,
        cancelUrl: getAmendmentsUrl({ dealId, facilityId, amendmentId, page: PORTAL_AMENDMENT_PAGES.CANCEL }),
        previousPage,
        errors: validationErrorHandler(errorsOrValue.errors),
        isUsingFacilityEndDate,
        canMakerCancelAmendment,
      };

      return res.render('partials/amendments/do-you-have-a-facility-end-date.njk', viewModel);
    }

    const update = { isUsingFacilityEndDate: errorsOrValue.value };

    const updatedAmendment = await api.updateAmendment({ facilityId, amendmentId, update, userToken });

    if (!updatedAmendment) {
      console.error('Failed to update amendment %s for facility %s', amendmentId, facilityId);
      throw new AmendmentNotFoundError(amendmentId, facilityId);
    }

    return res.redirect(getNextPage(PORTAL_AMENDMENT_PAGES.DO_YOU_HAVE_A_FACILITY_END_DATE, updatedAmendment));
  } catch (error) {
    console.error('Error posting amendments do you have a facility end date page %o', error);
    return res.render('partials/problem-with-service.njk');
  }
};
