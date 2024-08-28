import { Response } from 'express';
import { getDate, getMonth, getYear, isSameDay, parseISO } from 'date-fns';
import { CustomExpressRequest, isFacilityEndDateEnabledOnGefVersion, parseDealVersion } from '@ukef/dtfs2-common';
import { isTrueSet, validationErrorHandler } from '../../utils/helpers';
import * as api from '../../services/api';
import { validateAndParseFacilityEndDate } from './validation';
import { asLoggedInUserSession, LoggedInUserSession } from '../../utils/express-session';
import { FacilityEndDateViewModel } from '../../types/view-models/facility-end-date-view-model';
import { getCoverStartDateOrStartOfToday } from '../../utils/get-cover-start-date-or-start-of-today';

type FacilityEndDateParams = { dealId: string; facilityId: string };
type FacilityEndDatePostBody = { 'facility-end-date-day': string; 'facility-end-date-month': string; 'facility-end-date-year': string };

type GetFacilityEndDateRequest = CustomExpressRequest<{ params: FacilityEndDateParams; query: { status: string | undefined } }>;
type PostFacilityEndDateRequest = CustomExpressRequest<{
  reqBody: FacilityEndDatePostBody;
  params: FacilityEndDateParams;
  query: { saveAndReturn: string; status: string | undefined };
}>;

type HandleGetFacilityEndDateParams = {
  req: GetFacilityEndDateRequest;
  res: Response;
  previousPage: string;
};

type PostRequestUris = {
  nextPage: string;
  previousPage: string;
  saveAndReturn: string;
};

type HandlePostFacilityEndDateParams = {
  req: PostFacilityEndDateRequest;
  res: Response;
  uris: PostRequestUris;
};

const getFacilityEndDateViewModel = (facility: Record<string, unknown>, previousPage: string, status: string | undefined): FacilityEndDateViewModel => {
  if (typeof facility.dealId !== 'string' || typeof facility._id !== 'string') {
    throw new Error('Invalid facility or deal id provided');
  }

  const facilityEndDateViewModel: FacilityEndDateViewModel = {
    dealId: facility.dealId,
    facilityId: facility._id,
    previousPage,
    status,
  };

  if (typeof facility.facilityEndDate === 'string') {
    const facilityEndDate = parseISO(facility.facilityEndDate);
    facilityEndDateViewModel.facilityEndDate = {
      day: String(getDate(facilityEndDate)),
      month: String(getMonth(facilityEndDate) + 1),
      year: String(getYear(facilityEndDate)),
    };
  }

  return facilityEndDateViewModel;
};

const handleGetFacilityEndDate = async ({ req, res, previousPage }: HandleGetFacilityEndDateParams) => {
  const {
    params: { dealId, facilityId },
    query: { status },
    session: { userToken },
  } = req;

  try {
    const { details: facility } = (await api.getFacility({ facilityId, userToken })) as { details: Record<string, unknown> };
    const deal = (await api.getApplication({ dealId, userToken })) as Record<string, unknown> & { version?: number };

    const shouldRedirectFromPage = !isFacilityEndDateEnabledOnGefVersion(parseDealVersion(deal.version)) || !facility.isUsingFacilityEndDate;

    if (shouldRedirectFromPage) {
      return res.redirect(previousPage);
    }

    return res.render('partials/facility-end-date.njk', getFacilityEndDateViewModel(facility, previousPage, status));
  } catch (error) {
    console.error(error);
    return res.render('partials/problem-with-service.njk');
  }
};

export const getFacilityEndDateFromUnissuedFacilitiesPage = async (req: GetFacilityEndDateRequest, res: Response) =>
  handleGetFacilityEndDate({ req, res, previousPage: `/gef/application-details/${req.params.dealId}/unissued-facilities/${req.params.facilityId}/about` });

export const getFacilityEndDateFromApplicationPreviewPage = async (req: GetFacilityEndDateRequest, res: Response) =>
  handleGetFacilityEndDate({ req, res, previousPage: `/gef/application-details/${req.params.dealId}/unissued-facilities/${req.params.facilityId}/change` });

export const getFacilityEndDateFromApplicationDetailsPage = async (req: GetFacilityEndDateRequest, res: Response) =>
  handleGetFacilityEndDate({ req, res, previousPage: `/gef/application-details/${req.params.dealId}/facilities/${req.params.facilityId}/about-facility` });

const updateFacilityEndDateIfChanged = async (
  existingFacility: Record<string, unknown>,
  facilityEndDate: Date,
  { userToken, user }: LoggedInUserSession,
): Promise<void> => {
  const facilityEndDateNeedsUpdating =
    typeof existingFacility.facilityEndDate !== 'string' || !isSameDay(parseISO(existingFacility.facilityEndDate), facilityEndDate);

  if (!facilityEndDateNeedsUpdating) {
    return;
  }
  await api.updateFacility({
    facilityId: existingFacility._id,
    payload: {
      facilityEndDate,
    },
    userToken,
  });

  const applicationUpdate = {
    editorId: user._id,
  };
  await api.updateApplication({ dealId: existingFacility.dealId, application: applicationUpdate, userToken });
};

const handlePostFacilityEndDate = async ({ req, res, uris }: HandlePostFacilityEndDateParams) => {
  try {
    const {
      params: { dealId, facilityId },
      body: { 'facility-end-date-year': facilityEndDateYear, 'facility-end-date-month': facilityEndDateMonth, 'facility-end-date-day': facilityEndDateDay },
      query: { saveAndReturn, status },
    } = req;

    const { userToken } = asLoggedInUserSession(req.session);

    const facilityEndDateIsBlank = !facilityEndDateYear && !facilityEndDateMonth && !facilityEndDateDay;

    // If the user clicks save and return with no values filled in, we do not update the database
    if (isTrueSet(saveAndReturn) && facilityEndDateIsBlank) {
      return res.redirect(uris.saveAndReturn);
    }

    const { details: facility } = (await api.getFacility({ facilityId, userToken })) as { details: Record<string, unknown> };

    const facilityEndDateErrorsAndDate = validateAndParseFacilityEndDate(
      {
        day: facilityEndDateDay,
        month: facilityEndDateMonth,
        year: facilityEndDateYear,
      },
      getCoverStartDateOrStartOfToday(facility),
    );

    if ('errors' in facilityEndDateErrorsAndDate) {
      const facilityEndDateViewModel: FacilityEndDateViewModel = {
        errors: validationErrorHandler(facilityEndDateErrorsAndDate.errors),
        dealId,
        facilityId,
        facilityEndDate: {
          day: facilityEndDateDay,
          month: facilityEndDateMonth,
          year: facilityEndDateYear,
        },
        previousPage: uris.previousPage,
        status,
      };
      return res.render('partials/facility-end-date.njk', facilityEndDateViewModel);
    }

    await updateFacilityEndDateIfChanged(facility, facilityEndDateErrorsAndDate.date, asLoggedInUserSession(req.session));

    if (isTrueSet(saveAndReturn)) {
      return res.redirect(uris.saveAndReturn);
    }

    return res.redirect(uris.nextPage);
  } catch (error) {
    console.error(error);
    return res.render('partials/problem-with-service.njk');
  }
};

export const postFacilityEndDateFromApplicationPreviewPage = async (req: PostFacilityEndDateRequest, res: Response) =>
  handlePostFacilityEndDate({
    req,
    res,
    uris: {
      nextPage: `/gef/application-details/${req.params.dealId}`,
      saveAndReturn: `/gef/application-details/${req.params.dealId}`,
      previousPage: `/gef/application-details/${req.params.dealId}/unissued-facilities/${req.params.facilityId}/change`,
    },
  });

export const postFacilityEndDateFromUnissuedFacilitiesPage = async (req: PostFacilityEndDateRequest, res: Response) =>
  handlePostFacilityEndDate({
    req,
    res,
    uris: {
      nextPage: `/gef/application-details/${req.params.dealId}/unissued-facilities`,
      saveAndReturn: `/gef/application-details/${req.params.dealId}/unissued-facilities`,
      previousPage: `/gef/application-details/${req.params.dealId}/unissued-facilities/${req.params.facilityId}/about`,
    },
  });

export const postFacilityEndDateFromApplicationDetailsPage = async (req: PostFacilityEndDateRequest, res: Response) =>
  handlePostFacilityEndDate({
    req,
    res,
    uris: {
      nextPage: `/gef/application-details/${req.params.dealId}/facilities/${req.params.facilityId}/provided-facility`,
      saveAndReturn: `/gef/application-details/${req.params.dealId}`,
      previousPage: `/gef/application-details/${req.params.dealId}/facilities/${req.params.facilityId}/about-facility`,
    },
  });
