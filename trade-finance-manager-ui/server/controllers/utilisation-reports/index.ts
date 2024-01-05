import { Request, Response } from 'express';
import { subMonths } from 'date-fns';
import api from '../../api';
import { getFormattedReportDueDate, getFormattedReportPeriod } from '../../services/utilisation-report-service';
import { getIsoMonth } from '../../helpers/date';
import { getReportReconciliationSummaryViewModel } from './helpers';
import { asString } from '../../helpers/validation';

export const getUtilisationReportsSummaryData = async (userToken: unknown) => {
  const currentDate = new Date();
  const reportPeriodDate = subMonths(currentDate, 1);
  const oneIndexedReportPeriodStartMonth = reportPeriodDate.getMonth() + 1;
  const reportPeriodYear = reportPeriodDate.getFullYear();

  const submissionMonth = getIsoMonth(currentDate);
  const reconciliationSummaryApiResponse = await api.getUtilisationReportsReconciliationSummary(submissionMonth, asString(userToken, 'userToken'));

  const reportReconciliationSummary = getReportReconciliationSummaryViewModel(reconciliationSummaryApiResponse);
  const reportPeriod = getFormattedReportPeriod();
  const reportDueDate = await getFormattedReportDueDate(userToken);

  return {
    reportReconciliationSummary,
    reportPeriod,
    reportDueDate,
    reportPeriodStartMonth: oneIndexedReportPeriodStartMonth,
    reportPeriodYear,
  };
};

export const getUtilisationReports = async (req: Request, res: Response) => {
  const { userToken, user } = req.session;

  try {
    const { reportReconciliationSummary, reportPeriod, reportDueDate, reportPeriodStartMonth, reportPeriodYear } = await getUtilisationReportsSummaryData(userToken);

    return res.render('utilisation-reports/utilisation-reports.njk', {
      user,
      activePrimaryNavigation: 'utilisation reports',
      reportReconciliationSummary,
      reportPeriod,
      reportDueDate,
      reportPeriodStartMonth,
      reportPeriodYear,
    });
  } catch (error) {
    console.error('Error rendering utilisation reports page', error);
    return res.render('_partials/problem-with-service.njk', { user });
  }
};
