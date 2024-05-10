import { Request, Response } from 'express';
import { asString, isNonEmptyString } from '@ukef/dtfs2-common';
import api from '../../../api';
import { asUserSession } from '../../../helpers/express-session';
import { validateSearchInput } from './search-input-validator';
import { PRIMARY_NAVIGATION_KEYS } from '../../../constants';
import { FindUtilisationReportsByYearViewModel } from '../../../types/view-models';

const renderFindUtilisationReportsByYearPage = (res: Response, viewModel: FindUtilisationReportsByYearViewModel) =>
  res.render('utilisation-reports/find-utilisation-reports-by-year.njk', viewModel);

export const getFindReportsByYear = async (req: Request, res: Response) => {
  const { user, userToken } = asUserSession(req.session);
  const { bank: bankIdQuery, year: yearQuery } = req.query;

  try {
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
      bankIdQuery: bankIdQuery ? asString(bankIdQuery, 'bankIdQuery') : undefined,
      yearQuery: yearQuery ? asString(yearQuery, 'yearQuery') : undefined,
      validBankIds,
    });

    if (bankError || yearError) {
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

    return res.render('utilisation-reports/bank-previous-years-reports.njk', {
      user,
    });
  } catch (error) {
    console.error('Failed to render find reports by year page:', error);
    return res.render('_partials/problem-with-service.njk', { user });
  }
};
