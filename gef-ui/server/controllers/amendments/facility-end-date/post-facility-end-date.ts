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
  query: { change?: 'true' };
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

    const amendment = await api.getAmendment({ facilityId, amendmentId, userToken });

    if (!amendment) {
      console.error('Amendment %s was not found for the facility %s', amendmentId, facilityId);
      return res.redirect('/not-found');
    }

    const validationErrorsOrValue = validateAndParseFacilityEndDate(facilityEndDateDayMonthYear, getCoverStartDateOrToday(facility));

    if ('errors' in validationErrorsOrValue) {
      const viewModel: FacilityEndDateViewModel = {
        exporterName: deal.exporter.companyName,
        facilityType: facility.type,
        cancelUrl: `/gef/application-details/${dealId}/facilities/${facilityId}/amendments/${amendmentId}/cancel`,
        previousPage,
        facilityEndDate: facilityEndDateDayMonthYear,
        errors: validationErrorHandler(validationErrorsOrValue.errors),
      };

      return res.render('partials/amendments/facility-end-date.njk', viewModel);
    }

    const update = { facilityEndDate: validationErrorsOrValue.value };

    const updatedAmendment = await api.updateAmendment({ facilityId, amendmentId, update, userToken });

    // If change is true, then the previous page is "Check your answers"
    // If the facility end date has changed, we need to go to the next page of the amendment journey.
    // Otherwise, the next page should be the previous page "Check your answers".
    const facilityEndDateHasChanged =
      amendment.facilityEndDate &&
      updatedAmendment.facilityEndDate &&
      new Date(amendment.facilityEndDate).getTime() !== new Date(updatedAmendment.facilityEndDate).getTime();
    const change = req.query.change === 'true' && !facilityEndDateHasChanged;
    const nextPage = getNextPage(PORTAL_AMENDMENT_PAGES.FACILITY_END_DATE, updatedAmendment, change);
    return res.redirect(nextPage);
  } catch (error) {
    console.error('Error posting amendments facility end date page %o', error);
    return res.render('partials/problem-with-service.njk');
  }
};
