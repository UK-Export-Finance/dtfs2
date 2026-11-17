import { Request, Response } from 'express';
import api from '@ukef/portal-ui/server/api';
import { asLoggedInUserSession } from '@ukef/portal-ui/server/helpers/express-session';
import { PreviousReportsViewModel } from '@ukef/portal-ui/server/types/view-models/previous-reports';
import { mapToPreviousReportsViewModel } from './helpers/previous-reports-view-model-mapper';

type GetPreviousReportsRequest = Request & {
  query: {
    targetYear?: string;
  };
};

export const getPreviousReports = async (req: GetPreviousReportsRequest, res: Response) => {
  const { user, userToken } = asLoggedInUserSession(req.session);
  const { targetYear: targetYearQuery } = req.query;

  try {
    const previousReportsByBank = await api.getPreviousUtilisationReportsByBank(userToken, user.bank.id);
    const previousReportsViewModel: PreviousReportsViewModel = mapToPreviousReportsViewModel(targetYearQuery, user, previousReportsByBank);

    return res.render('utilisation-report-service/previous-reports/previous-reports.njk', previousReportsViewModel);
  } catch (error) {
    console.error('Failed to get previous reports: %o', error);
    return res.render('_partials/problem-with-service.njk', { user });
  }
};
