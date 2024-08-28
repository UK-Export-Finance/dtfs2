import { Response } from 'express';
import { getDate, getMonth, getYear, parseISO } from 'date-fns';
import { CustomExpressRequest, isFacilityEndDateEnabledOnGefVersion, parseDealVersion } from '@ukef/dtfs2-common';
import * as api from '../../services/api';
import { FacilityEndDateViewModel } from '../../types/view-models/facility-end-date-view-model';
import { asLoggedInUserSession } from '../../utils/express-session';
import { Facility } from '../../types/facility';

type FacilityEndDateParams = { dealId: string; facilityId: string };

type GetFacilityEndDateRequest = CustomExpressRequest<{ params: FacilityEndDateParams; query: { status: string | undefined } }>;

type HandleGetFacilityEndDateParams = {
  req: GetFacilityEndDateRequest;
  res: Response;
  previousPage: string;
};

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
  } = req;
  const { userToken } = asLoggedInUserSession(req.session);

  try {
    const { details: facility } = await api.getFacility({ facilityId, userToken });
    const deal = await api.getApplication({ dealId, userToken });

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
