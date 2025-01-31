import { CustomExpressRequest, DayMonthYearInput } from '@ukef/dtfs2-common';
import { Response } from 'express';
import * as api from '../../../services/api';
import { EffectiveFromViewModel } from '../../../types/view-models/amendments/effective-from-view-model';
import { asLoggedInUserSession } from '../../../utils/express-session';
import { getAmendmentsUrl, getNextPage } from '../helpers/navigation.helper';
import { PORTAL_AMENDMENT_PAGES } from '../../../constants/amendments';
import { validationErrorHandler } from '../../../utils/helpers';
import { getCoverStartDateOrToday } from '../../../utils/get-cover-start-date-or-today.ts';
import { validateAndParseEffectiveFrom } from './validation.ts';

export type PostEffectiveFromRequest = CustomExpressRequest<{
  params: { dealId: string; facilityId: string; amendmentId: string };
  reqBody: {
    'effective-from-day': string;
    'effective-from-month': string;
    'effective-from-year': string;
    previousPage: string;
  };
}>;

/**
 * Controller to post the `Date amendment effective from` page
 * @param req - the request object
 * @param res - the response object
 */
export const postEffectiveFrom = async (req: PostEffectiveFromRequest, res: Response) => {
  try {
    const { dealId, facilityId, amendmentId } = req.params;
    const { previousPage } = req.body;
    const { userToken } = asLoggedInUserSession(req.session);

    const effectiveFromDayMonthYear: DayMonthYearInput = {
      day: req.body['effective-from-day'],
      month: req.body['effective-from-month'],
      year: req.body['effective-from-year'],
    };

    const deal = await api.getApplication({ dealId, userToken });
    const { details: facility } = await api.getFacility({ facilityId, userToken });

    if (!deal || !facility) {
      console.error('Deal %s or Facility %s was not found', dealId, facilityId);
      return res.redirect('/not-found');
    }

    const validationErrorsOrValue = validateAndParseEffectiveFrom(effectiveFromDayMonthYear, getCoverStartDateOrToday(facility));

    if ('errors' in validationErrorsOrValue) {
      const viewModel: EffectiveFromViewModel = {
        exporterName: deal.exporter.companyName,
        facilityType: facility.type,
        cancelUrl: getAmendmentsUrl({ dealId, facilityId, amendmentId, page: PORTAL_AMENDMENT_PAGES.CANCEL }),
        previousPage,
        effectiveFrom: effectiveFromDayMonthYear,
        errors: validationErrorHandler(validationErrorsOrValue.errors),
      };

      return res.render('partials/amendments/effective-from.njk', viewModel);
    }

    const update = { effectiveFrom: validationErrorsOrValue.value };

    const amendment = await api.updateAmendment({ facilityId, amendmentId, update, userToken });

    return res.redirect(getNextPage(PORTAL_AMENDMENT_PAGES.EFFECTIVE_DATE, amendment));
  } catch (error) {
    console.error('Error posting amendments effective from page %o', error);
    return res.render('partials/problem-with-service.njk');
  }
};
