import { Request, Response } from 'express';
import api from '../../../api';
import { getIsoMonth } from '../../../helpers/date';
import { asUserSession } from '../../../helpers/express-session';
import { PRIMARY_NAVIGATION_KEYS } from '../../../constants';

export const getUtilisationReportByBankId = async (req: Request, res: Response) => {
  const { userToken, user } = asUserSession(req.session);
  const { bankId } = req.params;

  try {
    const currentPeriodSubmissionMonth = getIsoMonth(new Date());
    const reconciliationSummaryItems = await api.getUtilisationReportsReconciliationSummary(currentPeriodSubmissionMonth, userToken);
    const bank = reconciliationSummaryItems
      .find((summaryItem) => summaryItem.submissionMonth === currentPeriodSubmissionMonth)
      ?.items.find((item) => item.bank.id === bankId)?.bank;
    if (!bank) {
      console.error(`Bank with id ${bankId} not found`);
      return res.redirect('/not-found');
    }

    return res.render('utilisation-reports/utilisation-report-for-bank.njk', {
      user,
      activePrimaryNavigation: PRIMARY_NAVIGATION_KEYS.UTILISATION_REPORTS,
      bank,
      // reportPeriod, // comes from new stuff Francesca is adding
    });
  } catch (error) {
    console.error(`Error rendering utilisation reports for bank with id ${bankId}:`, error);
    return res.render('_partials/problem-with-service.njk', { user });
  }
};
