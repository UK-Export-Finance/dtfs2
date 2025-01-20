import { CustomExpressRequest, DayMonthYearInput } from '@ukef/dtfs2-common';
import { Response } from 'express';
import * as api from '../../../services/api';
import { FacilityEndDateViewModel } from '../../../types/view-models/amendments/facility-end-date-view-model';
import { asLoggedInUserSession } from '../../../utils/express-session';
import { getNextPage } from '../helpers/navigation.helper';
import { PORTAL_AMENDMENT_PAGES } from '../../../constants/amendments';
import { validateAndParseFacilityEndDate } from '../../facility-end-date/validation';
import { getCoverStartDateOrToday } from '../../../utils/get-cover-start-date-or-today';
import { validationErrorHandler } from '../../../utils/helpers';

export type PostFacilityEndDateRequest = CustomExpressRequest<{
  params: { dealId: string; facilityId: string; amendmentId: string };
  reqBody: {
    'facility-end-date-day': string;
    'facility-end-date-month': string;
    'facility-end-date-year': string;
    previousPage: string;
  };
}>;

/**
 * Controller to post the `Facility end date` page
 * @param req - the request object
 * @param res - the response object
 */
export const postFacilityEndDate = async (req: PostFacilityEndDateRequest, res: Response) => {
  try {
    const { dealId, facilityId, amendmentId } = req.params;
    const { previousPage } = req.body;
    const { userToken } = asLoggedInUserSession(req.session);

    const facilityEndDateDayMonthYear: DayMonthYearInput = {
      day: req.body['facility-end-date-day'],
      month: req.body['facility-end-date-month'],
      year: req.body['facility-end-date-year'],
    };

    const deal = await api.getApplication({ dealId, userToken });
    const { details: facility } = await api.getFacility({ facilityId, userToken });

    if (!deal || !facility) {
      console.error('Deal %s or Facility %s was not found', dealId, facilityId);
      return res.redirect('/not-found');
    }

    const validationErrorsOrValue = validateAndParseFacilityEndDate(facilityEndDateDayMonthYear, getCoverStartDateOrToday(facility));

    if ('errors' in validationErrorsOrValue) {
      const viewModel: FacilityEndDateViewModel = {
        exporterName: deal.exporter.companyName,
        cancelUrl: `/gef/application-details/${dealId}/facilities/${facilityId}/amendments/${amendmentId}/cancel`,
        previousPage,
        facilityEndDate: facilityEndDateDayMonthYear,
        errors: validationErrorHandler(validationErrorsOrValue.errors),
      };

      return res.render('partials/amendments/facility-end-date.njk', viewModel);
    }

    const update = { facilityEndDate: validationErrorsOrValue.value };

    const amendment = await api.updateAmendment({ facilityId, amendmentId, update, userToken });

    return res.redirect(getNextPage(PORTAL_AMENDMENT_PAGES.FACILITY_END_DATE, amendment));
  } catch (error) {
    console.error('Error posting amendments facility end date page %o', error);
    return res.render('partials/problem-with-service.njk');
  }
};
