import { CustomExpressRequest, DayMonthYearInput } from '@ukef/dtfs2-common';
import { Response } from 'express';
import * as api from '../../../services/api';
import { CoverEndDateViewModel } from '../../../types/view-models/amendments/cover-end-date-view-model';
import { asLoggedInUserSession } from '../../../utils/express-session';
import { getNextPage } from '../helpers/navigation.helper';
import { PORTAL_AMENDMENT_PAGES } from '../../../constants/amendments';
import { validateAndParseCoverEndDate } from './validation';
import { getCoverStartDateOrStartOfToday } from '../../../utils/get-cover-start-date-or-start-of-today';
import { validationErrorHandler } from '../../../utils/helpers';

export type PostCoverEndDateRequest = CustomExpressRequest<{
  params: { dealId: string; facilityId: string; amendmentId: string };
  reqBody: {
    'cover-end-date-day': string;
    'cover-end-date-month': string;
    'cover-end-date-year': string;
    previousPage: string;
  };
}>;

/**
 * Controller to post the `Cover end date` page
 * @param req - the request object
 * @param res - the response object
 */
export const postCoverEndDate = async (req: PostCoverEndDateRequest, res: Response) => {
  try {
    const { dealId, facilityId, amendmentId } = req.params;
    const { previousPage } = req.body;
    const { userToken } = asLoggedInUserSession(req.session);

    const coverEndDateDayMonthYear: DayMonthYearInput = {
      day: req.body['cover-end-date-day'],
      month: req.body['cover-end-date-month'],
      year: req.body['cover-end-date-year'],
    };

    const deal = await api.getApplication({ dealId, userToken });
    const { details: facility } = await api.getFacility({ facilityId, userToken });

    if (!deal || !facility) {
      console.error('Deal %s or Facility %s was not found', dealId, facilityId);
      return res.redirect('/not-found');
    }

    const validationErrorsOrValue = validateAndParseCoverEndDate(coverEndDateDayMonthYear, getCoverStartDateOrStartOfToday(facility));

    if ('errors' in validationErrorsOrValue) {
      const viewModel: CoverEndDateViewModel = {
        exporterName: deal.exporter.companyName,
        cancelUrl: `/gef/application-details/${dealId}/facilities/${facilityId}/amendments/${amendmentId}/cancel`,
        previousPage,
        coverEndDate: coverEndDateDayMonthYear,
        errors: validationErrorHandler(validationErrorsOrValue.errors),
      };

      return res.render('partials/amendments/cover-end-date.njk', viewModel);
    }

    const update = { coverEndDate: validationErrorsOrValue.value };

    const updatedAmendment = await api.updateAmendment({ facilityId, amendmentId, update, userToken });

    return res.redirect(getNextPage(PORTAL_AMENDMENT_PAGES.COVER_END_DATE, updatedAmendment));
  } catch (error) {
    console.error('Error posting amendments cover end date page %o', error);
    return res.render('partials/problem-with-service.njk');
  }
};
