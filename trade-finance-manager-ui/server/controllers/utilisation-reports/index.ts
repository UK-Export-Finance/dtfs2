import { Request, Response } from 'express';
import { validationResult } from 'express-validator';
import api from '../../api';
import { getFormattedReportDueDate, getFormattedReportPeriod } from '../../services/utilisation-report-service';
import { getIsoMonth } from '../../helpers/date';
import { getReportReconciliationSummaryViewModel } from './helpers';
import { asString } from '../../helpers/validation';

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
      activePrimaryNavigation: 'utilisation reports',
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

  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    console.error(`Error rendering utilisation for bank with id ${bankId}:`, errors.array());
    return res.render('_partials/problem-with-service.njk', { user });
  }

  try {
    const submissionMonth = getIsoMonth(new Date());
    const reconciliationSummaryApiResponse = await api.getUtilisationReportsReconciliationSummary(submissionMonth, asString(userToken));
    const bank = reconciliationSummaryApiResponse.find((summaryItem) => summaryItem.bank.id === bankId)?.bank;
    if (!bank) {
      throw new Error(`Bank with id ${bankId} not found`);
    }

    const reportPeriod = getFormattedReportPeriod();

    return res.render('utilisation-reports/utilisation-report-for-bank.njk', {
      user,
      activePrimaryNavigation: 'utilisation reports',
      bank,
      reportPeriod,
    });
  } catch (error) {
    console.error(`Error rendering utilisation for bank with id ${bankId}:`, error);
    return res.render('_partials/problem-with-service.njk', { user });
  }
};
