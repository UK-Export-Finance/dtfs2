import { Request, Response } from 'express';
import api from '@tfm-ui/api';
import { getIsoMonth } from '@tfm-ui/helpers/date';
import { asUserSession } from '@tfm-ui/helpers/express-session';
import { PRIMARY_NAVIGATION_KEYS } from '@tfm-ui/constants';
import { UtilisationReportsViewModel } from '@tfm-ui/types/view-models';
import { getReportReconciliationSummariesViewModel, isPDCReconcileUser } from './helpers';

/**
 * Controller to get utilisation reports page
 * @async
 * @function getUtilisationReports
 * @param {import('express').Request} req - The Express request object.
 * @param {import('express').Response} res - The Express response object.
 * @returns {Promise<void>} Renders utilisation reports page
 */
export const getUtilisationReports = async (req: Request, res: Response) => {
  const { userToken, user } = asUserSession(req.session);

  try {
    const currentPeriodSubmissionMonth = getIsoMonth(new Date());
    const reconciliationSummariesApiResponse = await api.getUtilisationReportsReconciliationSummary(currentPeriodSubmissionMonth, userToken);
    const reconciliationSummariesViewModel = await getReportReconciliationSummariesViewModel(reconciliationSummariesApiResponse, userToken);

    const viewModel: UtilisationReportsViewModel = {
      user,
      activePrimaryNavigation: PRIMARY_NAVIGATION_KEYS.UTILISATION_REPORTS,
      reportPeriodSummaries: reconciliationSummariesViewModel,
      isPDCReconcileUser: isPDCReconcileUser(user),
    };

    return res.render('utilisation-reports/utilisation-reports.njk', viewModel);
  } catch (error) {
    console.error('Error rendering utilisation reports page: %o', error);
    return res.render('_partials/problem-with-service.njk', { user });
  }
};
