import { Request, Response } from 'express';
import { Bank } from '@ukef/dtfs2-common';
import api from '../../../api';
import { asUserSession } from '../../../helpers/express-session';
import { validateSearchInput, validationError } from './search-input-validator';

export const getReportsByYear = async (req: Request, res: Response) => {
  try {
    const { bank: bankQuery, year: yearQuery } = req.query;
    const { user, userToken } = asUserSession(req.session);
    const banks: Bank[] = await api.getBanksVisibleInTfm(userToken);

    const bankNames = banks.map(bank => bank.name);

    const validationErrors: validationError[] = validateSearchInput(bankQuery, yearQuery, bankNames);
    
    if (validationErrors.length || (!bankQuery || !yearQuery)) {
      return res.render('utilisation-reports/find-utilisation-reports-by-year.njk', {
        user,
        banks,
        validationErrors,
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
