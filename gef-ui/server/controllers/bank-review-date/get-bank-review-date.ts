import { Response } from 'express';
import { getDate, getMonth, getYear, parseISO } from 'date-fns';
import { CustomExpressRequest, isFacilityEndDateEnabledOnGefVersion, parseDealVersion } from '@ukef/dtfs2-common';
import * as api from '../../services/api';
import { BankReviewDateViewModel } from '../../types/view-models/bank-review-date-view-model';

type BankReviewDateParams = { dealId: string; facilityId: string };

type GetBankReviewDateRequest = CustomExpressRequest<{ params: BankReviewDateParams; query: { status: string | undefined } }>;

type HandleGetBankReviewDateParams = {
  req: GetBankReviewDateRequest;
  res: Response;
  previousPage: string;
};

const getBankReviewDateViewModel = (facility: Record<string, unknown>, previousPage: string, status: string | undefined): BankReviewDateViewModel => {
  if (typeof facility.dealId !== 'string' || typeof facility._id !== 'string') {
    throw new Error('Invalid facility or deal id provided');
  }

  const bankReviewDateViewModel: BankReviewDateViewModel = {
    dealId: facility.dealId,
    facilityId: facility._id,
    previousPage,
    status,
  };

  if (typeof facility.bankReviewDate === 'string') {
    const bankReviewDate = parseISO(facility.bankReviewDate);
    bankReviewDateViewModel.bankReviewDate = {
      day: String(getDate(bankReviewDate)),
      month: String(getMonth(bankReviewDate) + 1),
      year: String(getYear(bankReviewDate)),
    };
  }

  return bankReviewDateViewModel;
};

const handleGetBankReviewDate = async ({ req, res, previousPage }: HandleGetBankReviewDateParams) => {
  const {
    params: { dealId, facilityId },
    query: { status },
    session: { userToken },
  } = req;

  try {
    const { details: facility } = (await api.getFacility({ facilityId, userToken })) as { details: Record<string, unknown> };
    const deal = (await api.getApplication({ dealId, userToken })) as Record<string, unknown> & { version?: number };

    const shouldRedirectFromPage = !isFacilityEndDateEnabledOnGefVersion(parseDealVersion(deal.version)) || facility.isUsingFacilityEndDate !== false;

    if (shouldRedirectFromPage) {
      return res.redirect(previousPage);
    }

    return res.render('partials/bank-review-date.njk', getBankReviewDateViewModel(facility, previousPage, status));
  } catch (error) {
    console.error(error);
    return res.render('partials/problem-with-service.njk');
  }
};

export const getBankReviewDateFromUnissuedFacilitiesPage = async (req: GetBankReviewDateRequest, res: Response) =>
  handleGetBankReviewDate({ req, res, previousPage: `/gef/application-details/${req.params.dealId}/unissued-facilities/${req.params.facilityId}/about` });

export const getBankReviewDateFromApplicationPreviewPage = async (req: GetBankReviewDateRequest, res: Response) =>
  handleGetBankReviewDate({ req, res, previousPage: `/gef/application-details/${req.params.dealId}/unissued-facilities/${req.params.facilityId}/change` });

export const getBankReviewDateFromApplicationDetailsPage = async (req: GetBankReviewDateRequest, res: Response) =>
  handleGetBankReviewDate({ req, res, previousPage: `/gef/application-details/${req.params.dealId}/facilities/${req.params.facilityId}/about-facility` });
