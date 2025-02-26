import { CustomExpressRequest, DayMonthYearInput } from '@ukef/dtfs2-common';
import { Response } from 'express';
import * as api from '../../../services/api';
import { BankReviewDateViewModel } from '../../../types/view-models/amendments/bank-review-date-view-model';
import { asLoggedInUserSession } from '../../../utils/express-session';
import { getAmendmentsUrl, getNextPage } from '../helpers/navigation.helper';
import { PORTAL_AMENDMENT_PAGES } from '../../../constants/amendments';
import { validateAndParseBankReviewDate } from '../../bank-review-date/validation';
import { validationErrorHandler } from '../../../utils/helpers';
import { getCoverStartDateOrToday } from '../../../utils/get-cover-start-date-or-today.ts';

export type PostBankReviewDateRequest = CustomExpressRequest<{
  params: { dealId: string; facilityId: string; amendmentId: string };
  reqBody: {
    'bank-review-date-day': string;
    'bank-review-date-month': string;
    'bank-review-date-year': string;
    previousPage: string;
  };
  query: { change?: 'true' };
}>;

/**
 * Controller to post the `Bank review date` page
 * @param req - the request object
 * @param res - the response object
 */
export const postBankReviewDate = async (req: PostBankReviewDateRequest, res: Response) => {
  try {
    const { dealId, facilityId, amendmentId } = req.params;
    const { previousPage } = req.body;
    const { userToken } = asLoggedInUserSession(req.session);

    const bankReviewDateDayMonthYear: DayMonthYearInput = {
      day: req.body['bank-review-date-day'],
      month: req.body['bank-review-date-month'],
      year: req.body['bank-review-date-year'],
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

    const validationErrorsOrValue = validateAndParseBankReviewDate(bankReviewDateDayMonthYear, getCoverStartDateOrToday(facility));

    if ('errors' in validationErrorsOrValue) {
      const viewModel: BankReviewDateViewModel = {
        exporterName: deal.exporter.companyName,
        facilityType: facility.type,
        cancelUrl: getAmendmentsUrl({ dealId, facilityId, amendmentId, page: PORTAL_AMENDMENT_PAGES.CANCEL }),
        previousPage,
        bankReviewDate: bankReviewDateDayMonthYear,
        errors: validationErrorHandler(validationErrorsOrValue.errors),
      };

      return res.render('partials/amendments/bank-review-date.njk', viewModel);
    }

    const update = { bankReviewDate: validationErrorsOrValue.value };

    const updatedAmendment = await api.updateAmendment({ facilityId, amendmentId, update, userToken });

    // If change is true, then the previous page is "Check your answers"
    // If the bank review date has changed, we need to go to the next page of the amendment journey.
    // Otherwise, the next page should be the previous page "Check your answers".
    const bankReviewDateHasChanged =
      !!amendment.bankReviewDate &&
      !!updatedAmendment.bankReviewDate &&
      new Date(amendment?.bankReviewDate).getTime() !== new Date(updatedAmendment?.bankReviewDate).getTime();

    const canMakeChange = req.query.change === 'true';
    const change = canMakeChange && !bankReviewDateHasChanged;
    const nextPage = getNextPage(PORTAL_AMENDMENT_PAGES.BANK_REVIEW_DATE, updatedAmendment, change);

    return res.redirect(nextPage);
  } catch (error) {
    console.error('Error posting amendments bank review date page %o', error);
    return res.render('partials/problem-with-service.njk');
  }
};
