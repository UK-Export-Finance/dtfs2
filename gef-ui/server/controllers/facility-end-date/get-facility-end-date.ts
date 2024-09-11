import { Response } from 'express';
import { getDate, getMonth, getYear, parseISO } from 'date-fns';
import { CustomExpressRequest, isFacilityEndDateEnabledOnGefVersion, parseDealVersion } from '@ukef/dtfs2-common';
import * as api from '../../services/api';
import { FacilityEndDateViewModel } from '../../types/view-models/facility-end-date-view-model';
import { asLoggedInUserSession } from '../../utils/express-session';
import { Facility } from '../../types/facility';

type GetFacilityEndDateRequest = CustomExpressRequest<{ params: { dealId: string; facilityId: string }; query: { status: string | undefined } }>;

type GetFacilityEndDateParams = {
  req: GetFacilityEndDateRequest;
  res: Response;
  previousPage: string;
};

/**
 * @param facility - the facility
 * @param previousPage - the previous page url
 * @param status - the query parameter status
 * @returns view model for the facility end date template
 */
const getFacilityEndDateViewModel = (facility: Facility, previousPage: string, status: string | undefined): FacilityEndDateViewModel => {
  if (typeof facility.dealId !== 'string' || typeof facility._id !== 'string') {
    throw new Error('Invalid facility or deal id provided');
  }

  const facilityEndDateViewModel: FacilityEndDateViewModel = {
    dealId: facility.dealId,
    facilityId: facility._id,
    previousPage,
    status,
  };

  if (facility.facilityEndDate) {
    const facilityEndDate = parseISO(facility.facilityEndDate);
    facilityEndDateViewModel.facilityEndDate = {
      day: String(getDate(facilityEndDate)),
      month: String(getMonth(facilityEndDate) + 1),
      year: String(getYear(facilityEndDate)),
    };
  }

  return facilityEndDateViewModel;
};

/**
 * Handle get facility end date requests
 */
const getFacilityEndDate = async ({ req, res, previousPage }: GetFacilityEndDateParams) => {
  const {
    params: { dealId, facilityId },
    query: { status },
  } = req;
  const { userToken } = asLoggedInUserSession(req.session);

  try {
    const { details: facility } = await api.getFacility({ facilityId, userToken });
    const deal = await api.getApplication({ dealId, userToken });

    const dealVersion = parseDealVersion(deal.version);
    const shouldRedirectFromPage = !isFacilityEndDateEnabledOnGefVersion(dealVersion) || !facility.isUsingFacilityEndDate;

    if (shouldRedirectFromPage) {
      return res.redirect(previousPage);
    }

    return res.render('partials/facility-end-date.njk', getFacilityEndDateViewModel(facility, previousPage, status));
  } catch (error) {
    console.error('Error in getFacilityEndDate %o', error);
    return res.render('partials/problem-with-service.njk');
  }
};

/**
 * Controller for get facility end date from unissued facilities page
 */
export const getFacilityEndDateFromUnissuedFacilitiesPage = async (req: GetFacilityEndDateRequest, res: Response) =>
  getFacilityEndDate({ req, res, previousPage: `/gef/application-details/${req.params.dealId}/unissued-facilities/${req.params.facilityId}/about` });

/**
 * Controller for get facility end date from application preview page
 */
export const getFacilityEndDateFromApplicationPreviewPage = async (req: GetFacilityEndDateRequest, res: Response) =>
  getFacilityEndDate({ req, res, previousPage: `/gef/application-details/${req.params.dealId}/unissued-facilities/${req.params.facilityId}/change` });

/**
 * Controller for get facility end date from application details page
 */
export const getFacilityEndDateFromApplicationDetailsPage = async (req: GetFacilityEndDateRequest, res: Response) =>
  getFacilityEndDate({ req, res, previousPage: `/gef/application-details/${req.params.dealId}/facilities/${req.params.facilityId}/about-facility` });
