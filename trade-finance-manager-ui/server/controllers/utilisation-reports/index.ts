import { Request, Response } from 'express';
import api from '../../api';
import { getIsoMonth } from '../../helpers/date';
import { getReportReconciliationSummariesViewModel } from './helpers';
import { asUserSession } from '../../helpers/express-session';

export const getUtilisationReports = async (req: Request, res: Response) => {
  const { userToken, user } = asUserSession(req.session);

  try {
    const currentPeriodSubmissionMonth = getIsoMonth(new Date());
    const reconciliationSummariesApiResponse = await api.getUtilisationReportsReconciliationSummary(currentPeriodSubmissionMonth, userToken);
    const reconciliationSummariesViewModel = await getReportReconciliationSummariesViewModel(reconciliationSummariesApiResponse, userToken);

    return res.render('utilisation-reports/utilisation-reports.njk', {
      user,
      activePrimaryNavigation: 'utilisation reports',
      reportPeriodSummaries: reconciliationSummariesViewModel,
    });
  } catch (error) {
    console.error('Error rendering utilisation reports page', error);
    return res.render('_partials/problem-with-service.njk', { user });
  }
};
