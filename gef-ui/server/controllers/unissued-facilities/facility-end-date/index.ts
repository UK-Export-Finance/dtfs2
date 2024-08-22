import { Response } from 'express';
import { getDate, getMonth, getYear, isSameDay, parseISO } from 'date-fns';
import { CustomExpressRequest, isFacilityEndDateEnabledOnGefVersion, parseDealVersion } from '@ukef/dtfs2-common';
import { isTrueSet, validationErrorHandler } from '../../../utils/helpers';
import * as api from '../../../services/api';
import { validateAndParseFacilityEndDate } from '../../../utils/validate-facility-end-date';
import { asLoggedInUserSession } from '../../../utils/express-session';
import { FacilityEndDateViewModel } from '../../../types/view-models/facility-end-date-view-model';
import { ValidationError } from '../../../types/validation-error';
import { getCoverStartDateOrStartOfToday } from '../../../utils/get-cover-start-date-or-start-of-today';

type FacilityEndDateParams = { dealId: string; facilityId: string };
type FacilityEndDatePostBody = { 'facility-end-date-day': string; 'facility-end-date-month': string; 'facility-end-date-year': string };

type GetFacilityEndDateRequest = CustomExpressRequest<{ params: FacilityEndDateParams; query: { change: string } }>;
type PostFacilityEndDateRequest = CustomExpressRequest<{
  reqBody: FacilityEndDatePostBody;
  params: FacilityEndDateParams;
  query: { saveAndReturn: string };
}>;

const getFacilityEndDateViewModel = async (req: GetFacilityEndDateRequest, previousPage: string): Promise<FacilityEndDateViewModel | null> => {
  const {
    params: { dealId, facilityId },
    session: { userToken },
  } = req;

  const { details: facility } = (await api.getFacility({ facilityId, userToken })) as { details: Record<string, unknown> };
  const deal = (await api.getApplication({ dealId, userToken })) as Record<string, unknown> & { version?: number };

  if (!isFacilityEndDateEnabledOnGefVersion(parseDealVersion(deal.version)) || !facility.isUsingFacilityEndDate) {
    return null;
  }

  const facilityEndDateViewModel: FacilityEndDateViewModel = {
    dealId,
    facilityId,
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
  } = req;

  const previousPage = `/gef/application-details/${dealId}/unissued-facilities/${facilityId}/about`;

  try {
    const facilityEndDateViewModel = await getFacilityEndDateViewModel(req, previousPage);

    if (!facilityEndDateViewModel) {
      return res.redirect(previousPage);
    }

    return res.render('partials/facility-end-date.njk', facilityEndDateViewModel);
  } catch (error) {
    console.error(error);
    return res.render('partials/problem-with-service.njk');
  }
};

export const getFacilityEndDateFromApplicationPreviewPage = async (req: GetFacilityEndDateRequest, res: Response) => {
  const {
    params: { dealId, facilityId },
  } = req;

  const previousPage = `/gef/application-details/${dealId}/unissued-facilities/${facilityId}/change`;

  try {
    const facilityEndDateViewModel = await getFacilityEndDateViewModel(req, previousPage);

    if (!facilityEndDateViewModel) {
      return res.redirect(previousPage);
    }
    return res.render('partials/facility-end-date.njk', facilityEndDateViewModel);
  } catch (error) {
    console.error(error);
    return res.render('partials/problem-with-service.njk');
  }
};

export const validateAndReturnErrorsOrUpdateFacilityEndDate = async (req: PostFacilityEndDateRequest): Promise<ValidationError[] | null> => {
  const {
    params: { dealId, facilityId },
    body: { 'facility-end-date-year': facilityEndDateYear, 'facility-end-date-month': facilityEndDateMonth, 'facility-end-date-day': facilityEndDateDay },
    query: { saveAndReturn },
  } = req;

  const { userToken, user } = asLoggedInUserSession(req.session);

  const facilityEndDateIsBlank = !facilityEndDateYear && !facilityEndDateMonth && !facilityEndDateDay;

  // If the user clicks save and return with no values filled in, we do not update the database
  if (isTrueSet(saveAndReturn) && facilityEndDateIsBlank) {
    return null;
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

  if (facilityEndDateErrorsAndDate.errors) {
    return facilityEndDateErrorsAndDate.errors;
  }

  const facilityEndDate = facilityEndDateErrorsAndDate.date;

  const facilityEndDateNeedsUpdating = typeof facility.facilityEndDate !== 'string' || !isSameDay(parseISO(facility.facilityEndDate), facilityEndDate);

  if (facilityEndDateNeedsUpdating) {
    await api.updateFacility({
      facilityId,
      payload: {
        facilityEndDate,
      },
      userToken,
    });

    const applicationUpdate = {
      editorId: user._id,
    };
    await api.updateApplication({ dealId, application: applicationUpdate, userToken });
  }

  return null;
};

export const postFacilityEndDateFromUnissuedFacilitiesPage = async (req: PostFacilityEndDateRequest, res: Response) => {
  try {
    const {
      params: { dealId, facilityId },
      body: { 'facility-end-date-year': facilityEndDateYear, 'facility-end-date-month': facilityEndDateMonth, 'facility-end-date-day': facilityEndDateDay },
    } = req;

    const facilityEndDateErrors = await validateAndReturnErrorsOrUpdateFacilityEndDate(req);

    if (facilityEndDateErrors) {
      const facilityEndDateViewModel: FacilityEndDateViewModel = {
        errors: validationErrorHandler(facilityEndDateErrors),
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

    return res.redirect(`/gef/application-details/${dealId}/unissued-facilities`);
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
    } = req;

    const facilityEndDateErrors = await validateAndReturnErrorsOrUpdateFacilityEndDate(req);

    if (facilityEndDateErrors) {
      const facilityEndDateViewModel: FacilityEndDateViewModel = {
        errors: validationErrorHandler(facilityEndDateErrors),
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

    return res.redirect(`/gef/application-details/${dealId}`);
  } catch (error) {
    console.error(error);
    return res.render('partials/problem-with-service.njk');
  }
};
