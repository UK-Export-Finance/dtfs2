import { Response } from 'express';
import { getDate, getMonth, getYear, isSameDay, parseISO } from 'date-fns';
import { CustomExpressRequest, isFacilityEndDateEnabledOnGefVersion, parseDealVersion } from '@ukef/dtfs2-common';
import { isTrueSet, validationErrorHandler } from '../../utils/helpers';
import * as api from '../../services/api';
import { validateAndParseFacilityEndDate } from '../../utils/validate-facility-end-date';
import { asLoggedInUserSession } from '../../utils/express-session';
import { FacilityEndDateViewModel } from '../../types/view-models/facility-end-date-view-model';
import { getCoverStartDateOrStartOfToday } from '../../utils/get-cover-start-date-or-start-of-today';

type FacilityEndDateParams = { dealId: string; facilityId: string };
type FacilityEndDatePostBody = { 'facility-end-date-day': string; 'facility-end-date-month': string; 'facility-end-date-year': string };

type GetFacilityEndDateRequest = CustomExpressRequest<{ params: FacilityEndDateParams; query: { status: string } }>;
type PostFacilityEndDateRequest = CustomExpressRequest<{
  reqBody: FacilityEndDatePostBody;
  params: FacilityEndDateParams;
  query: { saveAndReturn: string; status: string };
}>;

export const getFacilityEndDate = async (req: GetFacilityEndDateRequest, res: Response) => {
  const {
    params: { dealId, facilityId },
    query: { status },
    session: { userToken },
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
      status,
      previousPage: `/gef/application-details/${dealId}/facilities/${facilityId}/about-facility`,
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

export const postFacilityEndDate = async (req: PostFacilityEndDateRequest, res: Response) => {
  try {
    const {
      params: { dealId, facilityId },
      body: { 'facility-end-date-year': facilityEndDateYear, 'facility-end-date-month': facilityEndDateMonth, 'facility-end-date-day': facilityEndDateDay },
      query: { saveAndReturn, status },
    } = req;

    const { userToken, user } = asLoggedInUserSession(req.session);

    const facilityEndDateIsBlank = !facilityEndDateYear && !facilityEndDateMonth && !facilityEndDateDay;

    if (isTrueSet(saveAndReturn) && facilityEndDateIsBlank) {
      return res.redirect(`/gef/application-details/${dealId}`);
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
      return res.render('partials/facility-end-date.njk', {
        errors: validationErrorHandler(facilityEndDateErrorsAndDate.errors),
        dealId,
        facilityId,
        facilityEndDate: {
          day: facilityEndDateDay,
          month: facilityEndDateMonth,
          year: facilityEndDateYear,
        },
        status,
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

    if (isTrueSet(saveAndReturn)) {
      return res.redirect(`/gef/application-details/${dealId}`);
    }

    return res.redirect(`/gef/application-details/${dealId}/facilities/${facilityId}/provided-facility`);
  } catch (error) {
    console.error(error);
    return res.render('partials/problem-with-service.njk');
  }
};
