import { Request, Response } from 'express';
import { asString, isNonEmptyString, isTfmPaymentReconciliationFeatureFlagEnabled } from '@ukef/dtfs2-common';
import api from '../../../api';
import { asUserSession } from '../../../helpers/express-session';
import { validateSearchInput } from './search-input-validator';
import { PRIMARY_NAVIGATION_KEYS } from '../../../constants';
import {
  BankReportingYearsDataListViewModel,
  FindUtilisationReportsByYearViewModel,
  UtilisationReportsByBankAndYearViewModel,
} from '../../../types/view-models';
import { getFindReportSummaryItemViewModel } from '../helpers';
import { BankWithReportingYearsResponseBody } from '../../../api-response-types';

/**
 * Gets tha bank id query and year query as string
 * @param req - The request object
 * @returns The bank id and year query
 */
const getBankIdQueryAndYearQueryAsString = (
  req: Request,
): {
  bankIdQuery: string | undefined;
  yearQuery: string | undefined;
} => {
  const { bank, year } = req.query;
  const bankIdQuery = bank ? asString(bank, 'bankIdQuery') : undefined;
  const yearQuery = year ? asString(year, 'yearQuery') : undefined;
  return { bankIdQuery, yearQuery };
};

/**
 * Maps a bank with reporting years to a datalist view model
 * @param bank - The bank
 * @returns The datalist view model
 */
const mapBankWithReportingYearsToDataListViewModel = (bank: BankWithReportingYearsResponseBody): BankReportingYearsDataListViewModel => ({
  bankId: bank.id,
  reportingYears: bank.reportingYears,
});

/**
 * Controller for the GET find reports by year route
 * @param req - The request object
 * @param res - The response object
 */
export const getFindReportsByYear = async (req: Request, res: Response) => {
  const { user, userToken } = asUserSession(req.session);
  const { originalUrl } = req;

  try {
    const { bankIdQuery, yearQuery } = getBankIdQueryAndYearQueryAsString(req);

    const allBanksWithReportingYears = await api.getAllBanksWithReportingYears(userToken);
    const banksVisibleInTfm = allBanksWithReportingYears.filter((bank) => bank.isVisibleInTfmUtilisationReports);

    const validBankIds = banksVisibleInTfm.map((bank) => bank.id);
    const bankItems = banksVisibleInTfm.map((bank) => ({
      value: bank.id,
      text: bank.name,
      attributes: { 'data-cy': `${bank.id}-radio` },
    }));
    const bankReportingYearsDataLists = banksVisibleInTfm.map(mapBankWithReportingYearsToDataListViewModel);

    if (!originalUrl.includes('?')) {
      const viewModel: FindUtilisationReportsByYearViewModel = {
        user,
        activePrimaryNavigation: PRIMARY_NAVIGATION_KEYS.UTILISATION_REPORTS,
        bankItems,
        bankReportingYearsDataLists,
        errorSummary: [],
        bankError: undefined,
        yearError: undefined,
      };

      return res.render('utilisation-reports/find-utilisation-reports-by-year.njk', viewModel);
    }

    const { errorSummary, bankError, yearError, bankIdAsString, yearAsString } = validateSearchInput({
      bankIdQuery,
      yearQuery,
      validBankIds,
    });

    if (errorSummary.length !== 0) {
      const viewModel: FindUtilisationReportsByYearViewModel = {
        user,
        activePrimaryNavigation: PRIMARY_NAVIGATION_KEYS.UTILISATION_REPORTS,
        bankItems,
        bankReportingYearsDataLists,
        errorSummary,
        bankError,
        yearError,
        selectedBank: isNonEmptyString(bankIdQuery) ? bankIdQuery : undefined,
        selectedYear: isNonEmptyString(yearQuery) ? yearQuery : undefined,
      };

      return res.render('utilisation-reports/find-utilisation-reports-by-year.njk', viewModel);
    }

    const { bankName, year, reports } = await api.getReportSummariesByBankAndYear(userToken, bankIdAsString, yearAsString);

    const reportSummaryItemsViewModel = reports.map(getFindReportSummaryItemViewModel);
    const isTfmPaymentReconciliationFeatureEnabled = isTfmPaymentReconciliationFeatureFlagEnabled();

    const viewModel: UtilisationReportsByBankAndYearViewModel = {
      user,
      activePrimaryNavigation: PRIMARY_NAVIGATION_KEYS.UTILISATION_REPORTS,
      bankName,
      year,
      reports: reportSummaryItemsViewModel,
      isTfmPaymentReconciliationFeatureFlagEnabled: isTfmPaymentReconciliationFeatureEnabled,
    };

    return res.render('utilisation-reports/utilisation-reports-by-bank-and-year-results.njk', viewModel);
  } catch (error) {
    console.error('Failed to render find reports by year page: %o', error);
    return res.render('_partials/problem-with-service.njk', { user });
  }
};
