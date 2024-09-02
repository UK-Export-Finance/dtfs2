import { Response } from 'express';
import { isSameDay, parseISO } from 'date-fns';
import { CustomExpressRequest } from '@ukef/dtfs2-common';
import { isTrueSet, validationErrorHandler } from '../../utils/helpers';
import * as api from '../../services/api';
import { validateAndParseFacilityEndDate } from './validation';
import { asLoggedInUserSession, LoggedInUserSession } from '../../utils/express-session';
import { FacilityEndDateViewModel } from '../../types/view-models/facility-end-date-view-model';
import { getCoverStartDateOrStartOfToday } from '../../utils/get-cover-start-date-or-start-of-today';
import { Facility } from '../../types/facility';

type FacilityEndDateParams = { dealId: string; facilityId: string };
type FacilityEndDatePostBody = { 'facility-end-date-day': string; 'facility-end-date-month': string; 'facility-end-date-year': string };

type PostFacilityEndDateRequest = CustomExpressRequest<{
  reqBody: FacilityEndDatePostBody;
  params: FacilityEndDateParams;
  query: { saveAndReturn: string; status: string | undefined };
}>;

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

/**
 * Update the facility end date if it has changed
 * @param existingFacility the current facility from the api
 * @param facilityEndDate the new facility end date
 * @param session the user session
 */
const updateFacilityEndDateIfChanged = async (existingFacility: Facility, facilityEndDate: Date, { userToken, user }: LoggedInUserSession): Promise<void> => {
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

/**
 * handle post facility end date request
 */
const postFacilityEndDate = async ({ req, res, uris }: HandlePostFacilityEndDateParams) => {
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

    const { details: facility } = await api.getFacility({ facilityId, userToken });

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

/**
 * Controller for post bank review date from application preview page
 */
export const postFacilityEndDateFromApplicationPreviewPage = async (req: PostFacilityEndDateRequest, res: Response) =>
  postFacilityEndDate({
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
export const postFacilityEndDateFromUnissuedFacilitiesPage = async (req: PostFacilityEndDateRequest, res: Response) =>
  postFacilityEndDate({
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
export const postFacilityEndDateFromApplicationDetailsPage = async (req: PostFacilityEndDateRequest, res: Response) =>
  postFacilityEndDate({
    req,
    res,
    uris: {
      nextPage: `/gef/application-details/${req.params.dealId}/facilities/${req.params.facilityId}/provided-facility`,
      saveAndReturn: `/gef/application-details/${req.params.dealId}`,
      previousPage: `/gef/application-details/${req.params.dealId}/facilities/${req.params.facilityId}/about-facility`,
    },
  });
