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

type BankReviewDatePostBody = { 'bank-review-date-day': string; 'bank-review-date-month': string; 'bank-review-date-year': string };

export type PostBankReviewDateRequest = CustomExpressRequest<{
  reqBody: BankReviewDatePostBody;
  params: { dealId: string; facilityId: string };
  query: { saveAndReturn: string; status: string | undefined };
}>;

type PostRequestUris = {
  nextPage: string;
  previousPage: string;
  saveAndReturn: string;
};

type PostBankReviewDateParams = {
  req: PostBankReviewDateRequest;
  res: Response;
  uris: PostRequestUris;
};

/**
 * Update the bank review date if it has changed
 * @param existingFacility the current facility from the api
 * @param bankReviewDate the new bank review date
 * @param session the user session
 * @protected this function is exported for unit testing only. If it is used elsewhere it should be moved to a suitable commonised helper file
 */
export const updateBankReviewDateIfChanged = async (
  existingFacility: Facility,
  bankReviewDate: Date,
  { userToken, user }: LoggedInUserSession,
): Promise<void> => {
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

/**
 * Handle the bank review date request
 * @protected this function is exported for unit testing only
 */
export const postBankReviewDate = async ({ req, res, uris }: PostBankReviewDateParams) => {
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

/**
 * Controller for post bank review date from application preview page
 */
export const postBankReviewDateFromApplicationPreviewPage = async (req: PostBankReviewDateRequest, res: Response) =>
  postBankReviewDate({
    req,
    res,
    uris: {
      nextPage: `/gef/application-details/${req.params.dealId}`,
      saveAndReturn: `/gef/application-details/${req.params.dealId}`,
      previousPage: `/gef/application-details/${req.params.dealId}/unissued-facilities/${req.params.facilityId}/change`,
    },
  });

/**
 * Controller for post bank review date from unissued facilities page
 */
export const postBankReviewDateFromUnissuedFacilitiesPage = async (req: PostBankReviewDateRequest, res: Response) =>
  postBankReviewDate({
    req,
    res,
    uris: {
      nextPage: `/gef/application-details/${req.params.dealId}/unissued-facilities`,
      saveAndReturn: `/gef/application-details/${req.params.dealId}/unissued-facilities`,
      previousPage: `/gef/application-details/${req.params.dealId}/unissued-facilities/${req.params.facilityId}/about`,
    },
  });

/**
 * Controller for post bank review date from application details page
 */
export const postBankReviewDateFromApplicationDetailsPage = async (req: PostBankReviewDateRequest, res: Response) =>
  postBankReviewDate({
    req,
    res,
    uris: {
      nextPage: `/gef/application-details/${req.params.dealId}/facilities/${req.params.facilityId}/provided-facility`,
      saveAndReturn: `/gef/application-details/${req.params.dealId}`,
      previousPage: `/gef/application-details/${req.params.dealId}/facilities/${req.params.facilityId}/about-facility`,
    },
  });
