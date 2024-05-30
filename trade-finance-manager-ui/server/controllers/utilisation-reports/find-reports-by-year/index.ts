import { Request, Response } from 'express';
import { asString, isNonEmptyString, isTfmPaymentReconciliationFeatureFlagEnabled } from '@ukef/dtfs2-common';
import api from '../../../api';
import { asUserSession } from '../../../helpers/express-session';
import { validateSearchInput } from './search-input-validator';
import { PRIMARY_NAVIGATION_KEYS } from '../../../constants';
import { FindUtilisationReportsByYearViewModel, UtilisationReportsByBankAndYearViewModel } from '../../../types/view-models';
import { getFindReportSummaryItemViewModel } from '../helpers';

const renderFindUtilisationReportsByYearPage = (res: Response, viewModel: FindUtilisationReportsByYearViewModel) =>
  res.render('utilisation-reports/find-utilisation-reports-by-year.njk', viewModel);

const renderUtilisationReportsByBankAndYearResults = (res: Response, viewModel: UtilisationReportsByBankAndYearViewModel) =>
  res.render('utilisation-reports/utilisation-reports-by-bank-and-year-results.njk', viewModel);

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

export const getFindReportsByYear = async (req: Request, res: Response) => {
  const { user, userToken } = asUserSession(req.session);
  const { originalUrl } = req;

  try {
    const { bankIdQuery, yearQuery } = getBankIdQueryAndYearQueryAsString(req);

    const allBanks = await api.getAllBanks(userToken);
    const banksVisibleInTfm = allBanks.filter((bank) => bank.isVisibleInTfmUtilisationReports);

    const validBankIds = banksVisibleInTfm.map((bank) => bank.id);
    const bankItems = banksVisibleInTfm.map((bank) => ({
      value: bank.id,
      text: bank.name,
      attributes: { 'data-cy': `${bank.id}-radio` },
    }));

    if (!originalUrl.includes('?')) {
      return renderFindUtilisationReportsByYearPage(res, {
        user,
        activePrimaryNavigation: PRIMARY_NAVIGATION_KEYS.UTILISATION_REPORTS,
        bankItems,
        errorSummary: [],
        bankError: undefined,
        yearError: undefined,
      });
    }

    const { errorSummary, bankError, yearError, bankIdAsString, yearAsString } = validateSearchInput({
      bankIdQuery,
      yearQuery,
      validBankIds,
    });

    if (errorSummary.length !== 0) {
      return renderFindUtilisationReportsByYearPage(res, {
        user,
        activePrimaryNavigation: PRIMARY_NAVIGATION_KEYS.UTILISATION_REPORTS,
        bankItems,
        errorSummary,
        bankError,
        yearError,
        selectedBank: isNonEmptyString(bankIdQuery) ? bankIdQuery : undefined,
        selectedYear: isNonEmptyString(yearQuery) ? yearQuery : undefined,
      });
    }

    const { bankName, year, reports } = await api.getReportSummariesByBankAndYear(userToken, bankIdAsString, yearAsString);

    const reportSummaryItemsViewModel = reports.map(getFindReportSummaryItemViewModel);
    const isTfmPaymentReconciliationFeatureEnabled = isTfmPaymentReconciliationFeatureFlagEnabled();

    return renderUtilisationReportsByBankAndYearResults(res, {
      user,
      activePrimaryNavigation: PRIMARY_NAVIGATION_KEYS.UTILISATION_REPORTS,
      bankName,
      year,
      reports: reportSummaryItemsViewModel,
      isTfmPaymentReconciliationFeatureFlagEnabled: isTfmPaymentReconciliationFeatureEnabled,
    });
  } catch (error) {
    console.error('Failed to render find reports by year page:', error);
    return res.render('_partials/problem-with-service.njk', { user });
  }
};
