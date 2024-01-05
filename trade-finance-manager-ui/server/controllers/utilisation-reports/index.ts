import { Request, Response } from 'express';
import api from '../../api';
import { getFormattedReportDueDate, getFormattedReportPeriod } from '../../services/utilisation-report-service';
import { getIsoMonth } from '../../helpers/date';
import { getReportReconciliationSummaryViewModel } from './helpers';
import { asString } from '../../helpers/validation';
import { PRIMARY_NAVIGATION_KEYS } from '../../constants';

export const getUtilisationReports = async (req: Request, res: Response) => {
  const { userToken, user } = req.session;

  try {
    const submissionMonth = getIsoMonth(new Date());
    const reconciliationSummaryApiResponse = await api.getUtilisationReportsReconciliationSummary(submissionMonth, asString(userToken));

    const reportReconciliationSummary = getReportReconciliationSummaryViewModel(reconciliationSummaryApiResponse);
    const reportPeriod = getFormattedReportPeriod();
    const reportDueDate = await getFormattedReportDueDate(userToken);

    return res.render('utilisation-reports/utilisation-reports.njk', {
      user,
      activePrimaryNavigation: PRIMARY_NAVIGATION_KEYS.UTILISATION_REPORTS,
      reportReconciliationSummary,
      reportPeriod,
      reportDueDate,
    });
  } catch (error) {
    console.error('Error rendering utilisation reports page', error);
    return res.render('_partials/problem-with-service.njk', { user });
  }
};

export const getUtilisationReportByBankId = async (req: Request, res: Response) => {
  const { userToken, user } = req.session;
  const { bankId } = req.params;

  try {
    const submissionMonth = getIsoMonth(new Date());
    const reconciliationSummaryItems = await api.getUtilisationReportsReconciliationSummary(submissionMonth, asString(userToken));
    const bank = reconciliationSummaryItems.find((summaryItem) => summaryItem.bank.id === bankId)?.bank;
    if (!bank) {
      console.error(`Bank with id ${bankId} not found`);
      return res.redirect('/not-found');
    }

    const reportPeriod = getFormattedReportPeriod();

    return res.render('utilisation-reports/utilisation-report-for-bank.njk', {
      user,
      activePrimaryNavigation: PRIMARY_NAVIGATION_KEYS.UTILISATION_REPORTS,
      bank,
      reportPeriod,
    });
  } catch (error) {
    console.error(`Error rendering utilisation for bank with id ${bankId}:`, error);
    return res.render('_partials/problem-with-service.njk', { user });
  }
};
