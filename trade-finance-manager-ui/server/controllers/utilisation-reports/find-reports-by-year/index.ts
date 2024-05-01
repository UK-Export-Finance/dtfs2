import { Request, Response } from 'express';
import api from '../../../api';
import { asUserSession } from '../../../helpers/express-session';
import { validateSearchInput } from './search-input-validator';
import { PRIMARY_NAVIGATION_KEYS } from '../../../constants';
import { FindUtilisationReportsByYearViewModel } from '../../../types/view-models/find-utilisation-reports-by-year-view-model';

const renderFindUtilisationReportsByYearPage = (res: Response, viewModel: FindUtilisationReportsByYearViewModel) =>
  res.render('utilisation-reports/find-utilisation-reports-by-year.njk', viewModel);

export const getReportsByYear = async (req: Request, res: Response) => {
  try {
    const { bank: bankQuery, year: yearQuery } = req.query;
    const { user, userToken } = asUserSession(req.session);
    const banks = await api.getBanksVisibleInTfmUtilisationReports(userToken);

    const bankNames = banks.map((bank) => bank.name);
    const bankItems = banks.map((bank) => ({
      value: bank.id,
      text: bank.name,
      attributes: { 'data-cy': `${bank.name}-radio` },
    }));
    const { errorSummary, bankError, yearError } = validateSearchInput(bankQuery, yearQuery, bankNames);

    if (bankError || yearError || (!bankQuery && !yearQuery)) {
      renderFindUtilisationReportsByYearPage(res, {
        user,
        activePrimaryNavigation: PRIMARY_NAVIGATION_KEYS.UTILISATION_REPORTS,
        bankItems,
        errorSummary,
        bankError,
        yearError,
      });
    }

    return res.render('utilisation-reports/bank-previous-years-reports.njk', {
      user,
    });
  } catch (error) {
    console.error('Failed to download utilisation report', error);
    return res.render('_partials/problem-with-service.njk', { user: req.session.user });
  }
};
