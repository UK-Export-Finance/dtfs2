import { Request, Response } from 'express';
import api from '../../../api';
import { asUserSession } from '../../../helpers/express-session';

export const getReportsByYear = async (req: Request, res: Response) => {
  try {
    // const { bank, year } = req.query;
    // console.log(bank)
    // console.log(year)
    const { user, userToken } = asUserSession(req.session);
    const banks = await api.getBanksVisibleInTfm(userToken);

    return res.render('utilisation-reports/find-utilisation-reports-by-year.njk', {
      user,
      banks,
    });
  } catch (error) {
    console.error('Failed to download utilisation report', error);
    return res.render('_partials/problem-with-service.njk', { user: req.session.user });
  }
};
