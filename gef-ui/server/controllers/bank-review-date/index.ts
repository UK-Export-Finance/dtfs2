import { Response } from 'express';
import { getDate, getMonth, getYear, parseISO } from 'date-fns';
import { CustomExpressRequest, isFacilityEndDateEnabledOnGefVersion, parseDealVersion } from '@ukef/dtfs2-common';
import { validationErrorHandler } from '../../utils/helpers';
import { validateAndParseDayMonthYear } from '../../utils/day-month-year-validation';
import * as api from '../../services/api';

type BankReviewDateParams = { dealId: string; facilityId: string };
type BankReviewDatePostBody = { 'bank-review-date-day': string; 'bank-review-date-month': string; 'bank-review-date-year': string };
type BankReviewDateViewModel = { dealId: string; facilityId: string; status: string; bankReviewDate?: { day: string; month: string; year: string } };

export const getBankReviewDate = async (req: CustomExpressRequest<{ params: BankReviewDateParams; query: { status: string } }>, res: Response) => {
  const {
    params: { dealId, facilityId },
    query: { status },
    session: { userToken },
  } = req;

  try {
    const { details: facility } = (await api.getFacility({ facilityId, userToken })) as { details: Record<string, unknown> };
    const deal = (await api.getApplication({ dealId, userToken })) as Record<string, unknown> & { version?: number };

    if (!isFacilityEndDateEnabledOnGefVersion(parseDealVersion(deal.version))) {
      throw new Error('Invalid deal version number');
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

export const postBankReviewDate = async (req: CustomExpressRequest<{ reqBody: BankReviewDatePostBody; params: BankReviewDateParams }>, res: Response) => {
  const {
    params: { dealId, facilityId },
    body: { 'bank-review-date-year': bankReviewDateYear, 'bank-review-date-month': bankReviewDateMonth, 'bank-review-date-day': bankReviewDateDay },
    session: { userToken, user },
  } = req;

  const bankReviewDateErrorsAndDate = validateAndParseDayMonthYear({
    day: bankReviewDateDay,
    month: bankReviewDateMonth,
    year: bankReviewDateYear,
    errRef: 'bankReviewDate',
    variableDisplayName: 'bank review date',
  });

  if (bankReviewDateErrorsAndDate.errors) {
    return res.render('partials/bank-review-date.njk', {
      errors: validationErrorHandler(bankReviewDateErrorsAndDate.errors),
      dealId,
      facilityId,
      bankReviewDate: {
        day: bankReviewDateDay,
        month: bankReviewDateMonth,
        year: bankReviewDateYear,
      },
    });
  }

  await api.updateFacility({
    facilityId,
    payload: {
      bankReviewDate: bankReviewDateErrorsAndDate.date,
    },
    userToken,
  });

  const applicationUpdate = {
    editorId: user?._id,
  };
  await api.updateApplication({ dealId, application: applicationUpdate, userToken });

  // TODO: DTFS2-7162 - handle saveAndReturn

  return res.redirect(`/gef/application-details/${dealId}/facilities/${facilityId}/provided-facility`);
};
