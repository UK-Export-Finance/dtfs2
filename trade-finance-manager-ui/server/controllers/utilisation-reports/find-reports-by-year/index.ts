import { Request, Response } from 'express';
import { asString, isNonEmptyString } from '@ukef/dtfs2-common';
import api from '../../../api';
import { asUserSession } from '../../../helpers/express-session';
import { validateSearchInput } from './search-input-validator';
import { PRIMARY_NAVIGATION_KEYS } from '../../../constants';
import { FindUtilisationReportsByYearViewModel, PreviousBankReportsByYearViewModel } from '../../../types/view-models';

const renderFindUtilisationReportsByYearPage = (res: Response, viewModel: FindUtilisationReportsByYearViewModel) =>
  res.render('utilisation-reports/find-utilisation-reports-by-year.njk', viewModel);

const renderPreviousBankReportsByYear = (res: Response, viewModel: PreviousBankReportsByYearViewModel) =>
  res.render('utilisation-reports/previous-bank-reports-by-year.njk', viewModel);

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

    if (!bankIdQuery && !yearQuery) {
      return renderFindUtilisationReportsByYearPage(res, {
        user,
        activePrimaryNavigation: PRIMARY_NAVIGATION_KEYS.UTILISATION_REPORTS,
        bankItems,
        errorSummary: [],
        bankError: undefined,
        yearError: undefined,
      });
    }

    const { errorSummary, bankError, yearError } = validateSearchInput({
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

    return renderPreviousBankReportsByYear(res, { user });
  } catch (error) {
    console.error('Failed to render find reports by year page:', error);
    return res.render('_partials/problem-with-service.njk', { user });
  }
};
