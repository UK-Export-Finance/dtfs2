import { Response } from 'express';
import { getDate, getMonth, getYear, parseISO } from 'date-fns';
import { CustomExpressRequest, isFacilityEndDateEnabledOnGefVersion, parseDealVersion } from '@ukef/dtfs2-common';
import * as api from '../../services/api';
import { BankReviewDateViewModel } from '../../types/view-models/bank-review-date-view-model';
import { asLoggedInUserSession } from '../../utils/express-session';
import { Facility } from '../../types/facility';

export type GetBankReviewDateRequest = CustomExpressRequest<{ params: { dealId: string; facilityId: string }; query: { status: string | undefined } }>;

type HandleGetBankReviewDateParams = {
  req: GetBankReviewDateRequest;
  res: Response;
  previousPage: string;
};

/**
 * @param facility - the facility
 * @param previousPage - the previous page url
 * @param status - the query parameter status
 * @returns view model for the bank review date template
 * @protected this function is exported for unit testing only
 */
export const getBankReviewDateViewModel = (facility: Facility, previousPage: string, status?: string): BankReviewDateViewModel => {
  const bankReviewDateViewModel: BankReviewDateViewModel = {
    dealId: facility.dealId,
    facilityId: facility._id,
    previousPage,
    status,
  };

  if (facility.bankReviewDate) {
    const bankReviewDate = parseISO(facility.bankReviewDate);
    bankReviewDateViewModel.bankReviewDate = {
      day: String(getDate(bankReviewDate)),
      month: String(getMonth(bankReviewDate) + 1),
      year: String(getYear(bankReviewDate)),
    };
  }

  return bankReviewDateViewModel;
};

/**
 * Handle get bank review date requests
 * @protected this function is exported for unit testing only
 */
export const getBankReviewDate = async ({ req, res, previousPage }: HandleGetBankReviewDateParams) => {
  const {
    params: { dealId, facilityId },
    query: { status },
  } = req;
  const { userToken } = asLoggedInUserSession(req.session);

  try {
    const { details: facility } = await api.getFacility({ facilityId, userToken });
    const deal = await api.getApplication({ dealId, userToken });

    const dealVersion = parseDealVersion(deal.version);
    const shouldRedirectFromPage = !isFacilityEndDateEnabledOnGefVersion(dealVersion) || facility.isUsingFacilityEndDate !== false;

    if (shouldRedirectFromPage) {
      return res.redirect(previousPage);
    }

    return res.render('partials/bank-review-date.njk', getBankReviewDateViewModel(facility, previousPage, status));
  } catch (error) {
    console.error(error);
    return res.render('partials/problem-with-service.njk');
  }
};

/**
 * Controller for get bank review date from unissued facilities page
 */
export const getBankReviewDateFromUnissuedFacilitiesPage = async (req: GetBankReviewDateRequest, res: Response) =>
  getBankReviewDate({ req, res, previousPage: `/gef/application-details/${req.params.dealId}/unissued-facilities/${req.params.facilityId}/about` });

/**
 * Controller for get bank review date from application preview page
 */
export const getBankReviewDateFromApplicationPreviewPage = async (req: GetBankReviewDateRequest, res: Response) =>
  getBankReviewDate({ req, res, previousPage: `/gef/application-details/${req.params.dealId}/unissued-facilities/${req.params.facilityId}/change` });

/**
 * Controller for get bank review date from application details page
 */
export const getBankReviewDateFromApplicationDetailsPage = async (req: GetBankReviewDateRequest, res: Response) =>
  getBankReviewDate({ req, res, previousPage: `/gef/application-details/${req.params.dealId}/facilities/${req.params.facilityId}/about-facility` });
