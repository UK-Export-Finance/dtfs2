import { CustomExpressRequest, DayMonthYearInput } from '@ukef/dtfs2-common';
import { Response } from 'express';
import * as api from '../../../services/api';
import { EffectiveDateViewModel } from '../../../types/view-models/amendments/effective-date-view-model';
import { asLoggedInUserSession } from '../../../utils/express-session';
import { getAmendmentsUrl, getNextPage } from '../helpers/navigation.helper';
import { PORTAL_AMENDMENT_PAGES } from '../../../constants/amendments';
import { validationErrorHandler } from '../../../utils/helpers';
import { getCoverStartDateOrToday } from '../../../utils/get-cover-start-date-or-today';
import { validateAndParseEffectiveDate } from './validation';

export type PostEffectiveDateRequest = CustomExpressRequest<{
  params: { dealId: string; facilityId: string; amendmentId: string };
  reqBody: {
    'effective-date-day': string;
    'effective-date-month': string;
    'effective-date-year': string;
    previousPage: string;
  };
  query: { change?: 'true' };
}>;

/**
 * Controller to post the `Date amendment effective from` page
 * @param req - the request object
 * @param res - the response object
 */
export const postEffectiveDate = async (req: PostEffectiveDateRequest, res: Response) => {
  try {
    const { dealId, facilityId, amendmentId } = req.params;
    const { previousPage } = req.body;
    const { userToken } = asLoggedInUserSession(req.session);

    const effectiveDateDayMonthYear: DayMonthYearInput = {
      day: req.body['effective-date-day'],
      month: req.body['effective-date-month'],
      year: req.body['effective-date-year'],
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

    const validationErrorsOrValue = validateAndParseEffectiveDate(effectiveDateDayMonthYear, getCoverStartDateOrToday(facility));

    if ('errors' in validationErrorsOrValue) {
      const viewModel: EffectiveDateViewModel = {
        exporterName: deal.exporter.companyName,
        facilityType: facility.type,
        cancelUrl: getAmendmentsUrl({ dealId, facilityId, amendmentId, page: PORTAL_AMENDMENT_PAGES.CANCEL }),
        previousPage,
        effectiveDate: effectiveDateDayMonthYear,
        errors: validationErrorHandler(validationErrorsOrValue.errors),
      };

      return res.render('partials/amendments/effective-date.njk', viewModel);
    }

    const update = { effectiveDate: validationErrorsOrValue.value };

    const updatedAmendment = await api.updateAmendment({ facilityId, amendmentId, update, userToken });

    // If change is true, then the previous page is "Check your answers"
    // If the effective date has changed, we need to go to the next page of the amendment journey.
    // Otherwise, the next page should be the previous page "Check your answers".
    const effectiveDateHasChanged = amendment.effectiveDate !== updatedAmendment.effectiveDate;

    const change = req.query.change === 'true' && !effectiveDateHasChanged;
    const nextPage = getNextPage(PORTAL_AMENDMENT_PAGES.EFFECTIVE_DATE, updatedAmendment, change);

    return res.redirect(nextPage);
  } catch (error) {
    console.error('Error posting amendments effective date page %o', error);
    return res.render('partials/problem-with-service.njk');
  }
};
