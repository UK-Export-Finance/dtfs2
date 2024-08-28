import { Response } from 'express';
import { isSameDay, parseISO } from 'date-fns';
import { CustomExpressRequest } from '@ukef/dtfs2-common';
import { isTrueSet, validationErrorHandler } from '../../utils/helpers';
import * as api from '../../services/api';
import { validateAndParseBankReviewDate } from './validation';
import { asLoggedInUserSession, LoggedInUserSession } from '../../utils/express-session';
import { getCoverStartDateOrStartOfToday } from '../../utils/get-cover-start-date-or-start-of-today';
import { BankReviewDateViewModel } from '../../types/view-models/bank-review-date-view-model';
import { Facility } from '../../types/facility';

type BankReviewDateParams = { dealId: string; facilityId: string };
type BankReviewDatePostBody = { 'bank-review-date-day': string; 'bank-review-date-month': string; 'bank-review-date-year': string };

type PostBankReviewDateRequest = CustomExpressRequest<{
  reqBody: BankReviewDatePostBody;
  params: BankReviewDateParams;
  query: { saveAndReturn: string; status: string | undefined };
}>;

type PostRequestUris = {
  nextPage: string;
  previousPage: string;
  saveAndReturn: string;
};

type HandlePostBankReviewDateParams = {
  req: PostBankReviewDateRequest;
  res: Response;
  uris: PostRequestUris;
};

const updateBankReviewDateIfChanged = async (existingFacility: Facility, bankReviewDate: Date, { userToken, user }: LoggedInUserSession): Promise<void> => {
  const bankReviewDateNeedsUpdating =
    typeof existingFacility.bankReviewDate !== 'string' || !isSameDay(parseISO(existingFacility.bankReviewDate), bankReviewDate);

  if (!bankReviewDateNeedsUpdating) {
    return;
  }

  await api.updateFacility({
    facilityId: existingFacility._id,
    payload: {
      bankReviewDate,
    },
    userToken,
  });

  const applicationUpdate = {
    editorId: user._id,
  };
  await api.updateApplication({ dealId: existingFacility.dealId, application: applicationUpdate, userToken });
};

const handlePostBankReviewDate = async ({ req, res, uris }: HandlePostBankReviewDateParams) => {
  try {
    const {
      params: { dealId, facilityId },
      body: { 'bank-review-date-year': bankReviewDateYear, 'bank-review-date-month': bankReviewDateMonth, 'bank-review-date-day': bankReviewDateDay },
      query: { saveAndReturn, status },
    } = req;

    const { userToken } = asLoggedInUserSession(req.session);

    const bankReviewDateIsBlank = !bankReviewDateYear && !bankReviewDateMonth && !bankReviewDateDay;

    // If the user clicks save and return with no values filled in, we do not update the database
    if (isTrueSet(saveAndReturn) && bankReviewDateIsBlank) {
      return res.redirect(uris.saveAndReturn);
    }

    const { details: facility } = await api.getFacility({ facilityId, userToken });

    const bankReviewDateErrorsAndDate = validateAndParseBankReviewDate(
      {
        day: bankReviewDateDay,
        month: bankReviewDateMonth,
        year: bankReviewDateYear,
      },
      getCoverStartDateOrStartOfToday(facility),
    );

    if ('errors' in bankReviewDateErrorsAndDate) {
      const bankReviewDateViewModel: BankReviewDateViewModel = {
        errors: validationErrorHandler(bankReviewDateErrorsAndDate.errors),
        dealId,
        facilityId,
        bankReviewDate: {
          day: bankReviewDateDay,
          month: bankReviewDateMonth,
          year: bankReviewDateYear,
        },
        previousPage: uris.previousPage,
        status,
      };
      return res.render('partials/bank-review-date.njk', bankReviewDateViewModel);
    }

    await updateBankReviewDateIfChanged(facility, bankReviewDateErrorsAndDate.date, asLoggedInUserSession(req.session));

    if (isTrueSet(saveAndReturn)) {
      return res.redirect(uris.saveAndReturn);
    }

    return res.redirect(uris.nextPage);
  } catch (error) {
    console.error(error);
    return res.render('partials/problem-with-service.njk');
  }
};

export const postBankReviewDateFromApplicationPreviewPage = async (req: PostBankReviewDateRequest, res: Response) =>
  handlePostBankReviewDate({
    req,
    res,
    uris: {
      nextPage: `/gef/application-details/${req.params.dealId}`,
      saveAndReturn: `/gef/application-details/${req.params.dealId}`,
      previousPage: `/gef/application-details/${req.params.dealId}/unissued-facilities/${req.params.facilityId}/change`,
    },
  });

export const postBankReviewDateFromUnissuedFacilitiesPage = async (req: PostBankReviewDateRequest, res: Response) =>
  handlePostBankReviewDate({
    req,
    res,
    uris: {
      nextPage: `/gef/application-details/${req.params.dealId}/unissued-facilities`,
      saveAndReturn: `/gef/application-details/${req.params.dealId}/unissued-facilities`,
      previousPage: `/gef/application-details/${req.params.dealId}/unissued-facilities/${req.params.facilityId}/about`,
    },
  });

export const postBankReviewDateFromApplicationDetailsPage = async (req: PostBankReviewDateRequest, res: Response) =>
  handlePostBankReviewDate({
    req,
    res,
    uris: {
      nextPage: `/gef/application-details/${req.params.dealId}/facilities/${req.params.facilityId}/provided-facility`,
      saveAndReturn: `/gef/application-details/${req.params.dealId}`,
      previousPage: `/gef/application-details/${req.params.dealId}/facilities/${req.params.facilityId}/about-facility`,
    },
  });
