import { Request, Response } from 'express';
import api from '../../../api';
import { asLoggedInUserSession } from '../../../helpers/express-session';
import { PreviousReportsViewModel } from '../../../types/view-models/previous-reports';
import { mapToPreviousReportsViewModel } from './helpers/previous-reports-view-model-mapper';

type GetPreviousReportsRequest = Request & {
  query: {
    targetYear?: string;
  };
};

const renderPreviousReportsPage = (res: Response, context: PreviousReportsViewModel) => {
  res.render('utilisation-report-service/previous-reports/previous-reports.njk', context);
};

export const getPreviousReports = async (req: GetPreviousReportsRequest, res: Response) => {
  const { user, userToken } = asLoggedInUserSession(req.session);
  const { targetYear: targetYearQuery } = req.query;

  try {
    const previousReportsByBank = await api.getPreviousUtilisationReportsByBank(userToken, user.bank.id);
    const previousReportsViewModel = mapToPreviousReportsViewModel(targetYearQuery, user, previousReportsByBank);
    return renderPreviousReportsPage(res, previousReportsViewModel);
  } catch (error) {
    console.error('Failed to get previous reports: %s', error);
    return res.render('_partials/problem-with-service.njk', { user });
  }
};
