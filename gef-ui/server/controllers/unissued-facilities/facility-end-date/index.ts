import { Response } from 'express';
import { getDate, getMonth, getYear, isSameDay, parseISO, startOfDay } from 'date-fns';
import { CustomExpressRequest, isFacilityEndDateEnabledOnGefVersion, parseDealVersion } from '@ukef/dtfs2-common';
import { isTrueSet, validationErrorHandler } from '../../../utils/helpers';
import * as api from '../../../services/api';
import { validateAndParseFacilityEndDate } from './validation';
import { asLoggedInUserSession } from '../../../utils/express-session';

type FacilityEndDateParams = { dealId: string; facilityId: string };
type FacilityEndDatePostBody = { 'facility-end-date-day': string; 'facility-end-date-month': string; 'facility-end-date-year': string };
type FacilityEndDateViewModel = {
  dealId: string;
  facilityId: string;
  facilityEndDate?: { day: string; month: string; year: string };
  previousPage: string;
};

type GetFacilityEndDateRequest = CustomExpressRequest<{ params: FacilityEndDateParams; query: { change: string } }>;
type PostFacilityEndDateRequest = CustomExpressRequest<{
  reqBody: FacilityEndDatePostBody;
  params: FacilityEndDateParams;
  query: { saveAndReturn: string; change: string };
}>;
export const getFacilityEndDate = async (req: GetFacilityEndDateRequest, res: Response) => {
  const {
    params: { dealId, facilityId },
    session: { userToken },
    query: { change },
  } = req;

  try {
    const { details: facility } = (await api.getFacility({ facilityId, userToken })) as { details: Record<string, unknown> };
    const deal = (await api.getApplication({ dealId, userToken })) as Record<string, unknown> & { version?: number };

    if (!isFacilityEndDateEnabledOnGefVersion(parseDealVersion(deal.version)) || !facility.isUsingFacilityEndDate) {
      return res.redirect(`/gef/application-details/${dealId}`);
    }

    const facilityEndDateViewModel: FacilityEndDateViewModel = {
      dealId,
      facilityId,
      previousPage: change
        ? `/gef/application-details/${dealId}/unissued-facilities/${facilityId}/change`
        : `/gef/application-details/${dealId}/unissued-facilities/${facilityId}/about`,
    };

    if ('facilityEndDate' in facility && typeof facility.facilityEndDate === 'string') {
      const facilityEndDate = parseISO(facility.facilityEndDate);
      facilityEndDateViewModel.facilityEndDate = {
        day: String(getDate(facilityEndDate)),
        month: String(getMonth(facilityEndDate) + 1),
        year: String(getYear(facilityEndDate)),
      };
    }

    return res.render('partials/facility-end-date.njk', facilityEndDateViewModel);
  } catch (error) {
    console.error(error);
    return res.render('partials/problem-with-service.njk');
  }
};

const getCoverStartDateOrStartOfToday = (facility: Record<string, unknown>): Date => {
  if (typeof facility.coverStartDate === 'string') {
    return startOfDay(parseISO(facility.coverStartDate));
  }

  if (!facility.coverStartDate) {
    return startOfDay(new Date());
  }

  throw new Error('Invalid coverStartDate');
};

export const postFacilityEndDate = async (req: PostFacilityEndDateRequest, res: Response) => {
  try {
    const {
      params: { dealId, facilityId },
      body: { 'facility-end-date-year': facilityEndDateYear, 'facility-end-date-month': facilityEndDateMonth, 'facility-end-date-day': facilityEndDateDay },
      query: { saveAndReturn, change },
    } = req;

    const { userToken, user } = asLoggedInUserSession(req.session);

    const facilityEndDateIsBlank = !facilityEndDateYear && !facilityEndDateMonth && !facilityEndDateDay;

    if (isTrueSet(saveAndReturn) && facilityEndDateIsBlank) {
      if (change) {
        return res.redirect(`/gef/application-details/${dealId}`);
      }

      return res.redirect(`/gef/application-details/${dealId}/unissued-facilities`);
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
      return res.render('partials/facility-end-date.njk', {
        errors: validationErrorHandler(facilityEndDateErrorsAndDate.errors),
        dealId,
        facilityId,
        facilityEndDate: {
          day: facilityEndDateDay,
          month: facilityEndDateMonth,
          year: facilityEndDateYear,
        },
      });
    }

    const facilityEndDate = facilityEndDateErrorsAndDate.date;

    const facilityEndDateValueIsUnchanged = typeof facility.facilityEndDate === 'string' && isSameDay(parseISO(facility.facilityEndDate), facilityEndDate);

    if (!facilityEndDateValueIsUnchanged) {
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

    if (change) {
      return res.redirect(`/gef/application-details/${dealId}`);
    }

    return res.redirect(`/gef/application-details/${dealId}/unissued-facilities`);
  } catch (error) {
    console.error(error);
    return res.render('partials/problem-with-service.njk');
  }
};
