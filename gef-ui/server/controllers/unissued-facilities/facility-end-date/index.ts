import { Response } from 'express';
import { getDate, getMonth, getYear, isSameDay, parseISO } from 'date-fns';
import { CustomExpressRequest, isFacilityEndDateEnabledOnGefVersion, parseDealVersion } from '@ukef/dtfs2-common';
import { isTrueSet, validationErrorHandler } from '../../../utils/helpers';
import * as api from '../../../services/api';
import { validateAndParseFacilityEndDate } from '../../../utils/validate-facility-end-date';
import { asLoggedInUserSession, LoggedInUserSession } from '../../../utils/express-session';
import { FacilityEndDateViewModel } from '../../../types/view-models/facility-end-date-view-model';
import { getCoverStartDateOrStartOfToday } from '../../../utils/get-cover-start-date-or-start-of-today';

type FacilityEndDateParams = { dealId: string; facilityId: string };
type FacilityEndDatePostBody = { 'facility-end-date-day': string; 'facility-end-date-month': string; 'facility-end-date-year': string };

type GetFacilityEndDateRequest = CustomExpressRequest<{ params: FacilityEndDateParams; query: { change: string } }>;
type PostFacilityEndDateRequest = CustomExpressRequest<{
  reqBody: FacilityEndDatePostBody;
  params: FacilityEndDateParams;
  query: { saveAndReturn: string };
}>;

const shouldRedirectFromPage = (dealVersion: number | undefined, isUsingFacilityEndDate: unknown) =>
  !isFacilityEndDateEnabledOnGefVersion(parseDealVersion(dealVersion)) || !isUsingFacilityEndDate;

const getFacilityEndDateViewModel = (facility: Record<string, unknown>, previousPage: string): FacilityEndDateViewModel => {
  if (typeof facility.dealId !== 'string' || typeof facility._id !== 'string') {
    throw new Error('Invalid facility ids stored in database');
  }

  const facilityEndDateViewModel: FacilityEndDateViewModel = {
    dealId: facility.dealId,
    facilityId: facility._id,
    previousPage,
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

export const getFacilityEndDateFromUnissuedFacilitiesPage = async (req: GetFacilityEndDateRequest, res: Response) => {
  const {
    params: { dealId, facilityId },
    session: { userToken },
  } = req;

  const previousPage = `/gef/application-details/${dealId}/unissued-facilities/${facilityId}/about`;

  try {
    const { details: facility } = (await api.getFacility({ facilityId, userToken })) as { details: Record<string, unknown> };
    const deal = (await api.getApplication({ dealId, userToken })) as Record<string, unknown> & { version?: number };

    if (shouldRedirectFromPage(deal.version, facility.isUsingFacilityEndDate)) {
      return res.redirect(previousPage);
    }

    const facilityEndDateViewModel = getFacilityEndDateViewModel(facility, previousPage);

    return res.render('partials/facility-end-date.njk', facilityEndDateViewModel);
  } catch (error) {
    console.error(error);
    return res.render('partials/problem-with-service.njk');
  }
};

export const getFacilityEndDateFromApplicationPreviewPage = async (req: GetFacilityEndDateRequest, res: Response) => {
  const {
    params: { dealId, facilityId },
    session: { userToken },
  } = req;

  const previousPage = `/gef/application-details/${dealId}/unissued-facilities/${facilityId}/change`;

  try {
    const { details: facility } = (await api.getFacility({ facilityId, userToken })) as { details: Record<string, unknown> };
    const deal = (await api.getApplication({ dealId, userToken })) as Record<string, unknown> & { version?: number };

    if (shouldRedirectFromPage(deal.version, facility.isUsingFacilityEndDate)) {
      return res.redirect(previousPage);
    }

    const facilityEndDateViewModel = getFacilityEndDateViewModel(facility, previousPage);

    return res.render('partials/facility-end-date.njk', facilityEndDateViewModel);
  } catch (error) {
    console.error(error);
    return res.render('partials/problem-with-service.njk');
  }
};

const updateFacilityEndDateIfChanged = async (existingFacility: Record<string, unknown>, facilityEndDate: Date, userSession: LoggedInUserSession) => {
  const facilityEndDateNeedsUpdating =
    typeof existingFacility.facilityEndDate !== 'string' || !isSameDay(parseISO(existingFacility.facilityEndDate), facilityEndDate);

  if (facilityEndDateNeedsUpdating) {
    await api.updateFacility({
      facilityId: existingFacility._id,
      payload: {
        facilityEndDate,
      },
      userToken: userSession.userToken,
    });

    const applicationUpdate = {
      editorId: userSession.user._id,
    };
    await api.updateApplication({ dealId: existingFacility.dealId, application: applicationUpdate, userToken: userSession.userToken });
  }
};

export const postFacilityEndDateFromUnissuedFacilitiesPage = async (req: PostFacilityEndDateRequest, res: Response) => {
  try {
    const {
      params: { dealId, facilityId },
      body: { 'facility-end-date-year': facilityEndDateYear, 'facility-end-date-month': facilityEndDateMonth, 'facility-end-date-day': facilityEndDateDay },
      query: { saveAndReturn },
    } = req;

    const unissuedFacilitiesRedirectUri = `/gef/application-details/${dealId}/unissued-facilities`;

    const userSession = asLoggedInUserSession(req.session);

    const facilityEndDateIsBlank = !facilityEndDateYear && !facilityEndDateMonth && !facilityEndDateDay;

    // If the user clicks save and return with no values filled in, we do not update the database
    if (isTrueSet(saveAndReturn) && facilityEndDateIsBlank) {
      return res.redirect(unissuedFacilitiesRedirectUri);
    }

    const { details: facility } = (await api.getFacility({ facilityId, userToken: userSession.userToken })) as { details: Record<string, unknown> };

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
        previousPage: `/gef/application-details/${dealId}/unissued-facilities/${facilityId}/about`,
      };
      return res.render('partials/facility-end-date.njk', facilityEndDateViewModel);
    }

    await updateFacilityEndDateIfChanged(facility, facilityEndDateErrorsAndDate.date, asLoggedInUserSession(req.session));

    return res.redirect(unissuedFacilitiesRedirectUri);
  } catch (error) {
    console.error(error);
    return res.render('partials/problem-with-service.njk');
  }
};

export const postFacilityEndDateFromApplicationPreviewPage = async (req: PostFacilityEndDateRequest, res: Response) => {
  try {
    const {
      params: { dealId, facilityId },
      body: { 'facility-end-date-year': facilityEndDateYear, 'facility-end-date-month': facilityEndDateMonth, 'facility-end-date-day': facilityEndDateDay },
      query: { saveAndReturn },
    } = req;

    const applicationDetailsRedirectUri = `/gef/application-details/${dealId}`;

    const userSession = asLoggedInUserSession(req.session);

    const facilityEndDateIsBlank = !facilityEndDateYear && !facilityEndDateMonth && !facilityEndDateDay;

    // If the user clicks save and return with no values filled in, we do not update the database
    if (isTrueSet(saveAndReturn) && facilityEndDateIsBlank) {
      return res.redirect(applicationDetailsRedirectUri);
    }

    const { details: facility } = (await api.getFacility({ facilityId, userToken: userSession.userToken })) as { details: Record<string, unknown> };

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
        previousPage: `/gef/application-details/${dealId}/unissued-facilities/${facilityId}/change`,
      };
      return res.render('partials/facility-end-date.njk', facilityEndDateViewModel);
    }

    await updateFacilityEndDateIfChanged(facility, facilityEndDateErrorsAndDate.date, asLoggedInUserSession(req.session));

    return res.redirect(applicationDetailsRedirectUri);
  } catch (error) {
    console.error(error);
    return res.render('partials/problem-with-service.njk');
  }
};
