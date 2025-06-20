import { CustomExpressRequest, DayMonthYearInput, PORTAL_AMENDMENT_STATUS } from '@ukef/dtfs2-common';
import { Response } from 'express';
import * as api from '../../../services/api';
import { CoverEndDateViewModel } from '../../../types/view-models/amendments/cover-end-date-view-model';
import { asLoggedInUserSession } from '../../../utils/express-session';
import { getNextPage, getAmendmentsUrl } from '../helpers/navigation.helper';
import { PORTAL_AMENDMENT_PAGES } from '../../../constants/amendments';
import { validateAndParseCoverEndDate } from './validation';
import { getCoverStartDateOrToday } from '../../../utils/get-cover-start-date-or-today';
import { validationErrorHandler } from '../../../utils/helpers';

export type PostCoverEndDateRequest = CustomExpressRequest<{
  params: { dealId: string; facilityId: string; amendmentId: string };
  reqBody: {
    'cover-end-date-day': string;
    'cover-end-date-month': string;
    'cover-end-date-year': string;
    previousPage: string;
  };
  query: { change?: string };
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

    const amendment = await api.getAmendment({ facilityId, amendmentId, userToken });

    if (!amendment) {
      console.error('Amendment %s was not found for the facility %s', amendmentId, facilityId);
      return res.redirect('/not-found');
    }

    const validationErrorsOrValue = validateAndParseCoverEndDate(coverEndDateDayMonthYear, getCoverStartDateOrToday(facility));

    if ('errors' in validationErrorsOrValue) {
      const viewModel: CoverEndDateViewModel = {
        exporterName: deal.exporter.companyName,
        facilityType: facility.type,
        cancelUrl: getAmendmentsUrl({ dealId, facilityId, amendmentId, page: PORTAL_AMENDMENT_PAGES.CANCEL }),
        previousPage,
        coverEndDate: coverEndDateDayMonthYear,
        errors: validationErrorHandler(validationErrorsOrValue.errors),
        canMakerCancelAmendment: amendment.status === PORTAL_AMENDMENT_STATUS.DRAFT,
      };

      return res.render('partials/amendments/cover-end-date.njk', viewModel);
    }

    const update = { coverEndDate: validationErrorsOrValue.value };

    const updatedAmendment = await api.updateAmendment({ facilityId, amendmentId, update, userToken });
    /*
     * If change is true, then the previous page is "Check your answers"
     * If the cover end date has changed, we need to go to the next page of the amendment journey.
     * Otherwise, the next page should be the previous page "Check your answers".
     */
    const coverEndDateHasChanged = amendment.coverEndDate !== updatedAmendment.coverEndDate;

    const changeQuery = req.query?.change === 'true';
    const change = changeQuery && !coverEndDateHasChanged;
    const nextPage = getNextPage(PORTAL_AMENDMENT_PAGES.COVER_END_DATE, updatedAmendment, change);

    return res.redirect(nextPage);
  } catch (error) {
    console.error('Error posting amendments cover end date page %o', error);
    return res.render('partials/problem-with-service.njk');
  }
};
