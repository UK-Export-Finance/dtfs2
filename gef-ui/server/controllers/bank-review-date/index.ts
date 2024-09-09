import { Response } from 'express';
import { getDate, getMonth, getYear, isSameDay, parseISO } from 'date-fns';
import { AnyObject, CustomExpressRequest, isFacilityEndDateEnabledOnGefVersion, parseDealVersion } from '@ukef/dtfs2-common';
import { isTrueSet, validationErrorHandler } from '../../utils/helpers';
import * as api from '../../services/api';
import { validateAndParseBankReviewDate } from './validation';
import { asLoggedInUserSession } from '../../utils/express-session';
import { getCoverStartDateOrStartOfToday } from '../../utils/get-cover-start-date-or-start-of-today';

type BankReviewDateParams = { dealId: string; facilityId: string };
type BankReviewDatePostBody = { 'bank-review-date-day': string; 'bank-review-date-month': string; 'bank-review-date-year': string };
type BankReviewDateViewModel = { dealId: string; facilityId: string; status: string; bankReviewDate?: { day: string; month: string; year: string } };

type GetBankReviewDateRequest = CustomExpressRequest<{ params: BankReviewDateParams; query: { status: string } }>;
type PostBankReviewDateRequest = CustomExpressRequest<{
  reqBody: BankReviewDatePostBody;
  params: BankReviewDateParams;
  query: { saveAndReturn: string; status: string };
}>;

export const getBankReviewDate = async (req: GetBankReviewDateRequest, res: Response) => {
  const {
    params: { dealId, facilityId },
    query: { status },
    session: { userToken },
  } = req;

  try {
    const { details: facility } = (await api.getFacility({ facilityId, userToken })) as { details: AnyObject };
    const deal = (await api.getApplication({ dealId, userToken })) as AnyObject & { version?: number };

    if (!isFacilityEndDateEnabledOnGefVersion(parseDealVersion(deal.version)) || facility.isUsingFacilityEndDate !== false) {
      return res.redirect(`/gef/application-details/${dealId}`);
    }

    const bankReviewDateViewModel: BankReviewDateViewModel = {
      dealId,
      facilityId,
      status,
    };

    if ('bankReviewDate' in facility && typeof facility.bankReviewDate === 'string') {
      const bankReviewDate = parseISO(facility.bankReviewDate);
      bankReviewDateViewModel.bankReviewDate = {
        day: String(getDate(bankReviewDate)),
        month: String(getMonth(bankReviewDate) + 1),
        year: String(getYear(bankReviewDate)),
      };
    }

    return res.render('partials/bank-review-date.njk', bankReviewDateViewModel);
  } catch (error) {
    console.error(error);
    return res.render('partials/problem-with-service.njk');
  }
};

export const postBankReviewDate = async (req: PostBankReviewDateRequest, res: Response) => {
  try {
    const {
      params: { dealId, facilityId },
      body: { 'bank-review-date-year': bankReviewDateYear, 'bank-review-date-month': bankReviewDateMonth, 'bank-review-date-day': bankReviewDateDay },
      query: { saveAndReturn, status },
    } = req;
    const { userToken, user } = asLoggedInUserSession(req.session);

    const bankReviewDateIsBlank = !bankReviewDateYear && !bankReviewDateMonth && !bankReviewDateDay;

    if (isTrueSet(saveAndReturn) && bankReviewDateIsBlank) {
      return res.redirect(`/gef/application-details/${dealId}`);
    }

    const { details: facility } = (await api.getFacility({ facilityId, userToken })) as { details: AnyObject };

    const bankReviewDateErrorsAndDate = validateAndParseBankReviewDate(
      {
        day: bankReviewDateDay,
        month: bankReviewDateMonth,
        year: bankReviewDateYear,
      },
      getCoverStartDateOrStartOfToday(facility),
    );

    if ('errors' in bankReviewDateErrorsAndDate) {
      return res.render('partials/bank-review-date.njk', {
        errors: validationErrorHandler(bankReviewDateErrorsAndDate.errors),
        dealId,
        facilityId,
        bankReviewDate: {
          day: bankReviewDateDay,
          month: bankReviewDateMonth,
          year: bankReviewDateYear,
        },
        status,
      });
    }

    const bankReviewDate = bankReviewDateErrorsAndDate.date;
    const bankReviewDateValueIsUnchanged = typeof facility.bankReviewDate === 'string' && isSameDay(parseISO(facility.bankReviewDate), bankReviewDate);

    if (!bankReviewDateValueIsUnchanged) {
      await api.updateFacility({
        facilityId,
        payload: {
          bankReviewDate,
        },
        userToken,
      });

      const applicationUpdate = {
        editorId: user._id,
      };
      await api.updateApplication({ dealId, application: applicationUpdate, userToken });
    }

    if (isTrueSet(saveAndReturn)) {
      return res.redirect(`/gef/application-details/${dealId}`);
    }

    return res.redirect(`/gef/application-details/${dealId}/facilities/${facilityId}/provided-facility`);
  } catch (error) {
    console.error(error);
    return res.render('partials/problem-with-service.njk');
  }
};
