import { CustomExpressRequest } from '@ukef/dtfs2-common';
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

    const errorsOrValue = validateIsUsingFacilityEndDate(isUsingFacilityEndDate);

    if ('errors' in errorsOrValue) {
      const viewModel: DoYouHaveAFacilityEndDateViewModel = {
        exporterName: deal.exporter.companyName,
        cancelUrl: getAmendmentsUrl({ dealId, facilityId, amendmentId, page: PORTAL_AMENDMENT_PAGES.CANCEL }),
        previousPage,
        errors: validationErrorHandler(errorsOrValue.errors),
        isUsingFacilityEndDate,
      };

      return res.render('partials/amendments/do-you-have-a-facility-end-date.njk', viewModel);
    }

    const update = { isUsingFacilityEndDate: errorsOrValue.value };

    const amendment = await api.updateAmendment({ facilityId, amendmentId, update, userToken });

    return res.redirect(getNextPage(PORTAL_AMENDMENT_PAGES.DO_YOU_HAVE_A_FACILITY_END_DATE, amendment));
  } catch (error) {
    console.error('Error posting amendments do you have a facility end date page %o', error);
    return res.render('partials/problem-with-service.njk');
  }
};
