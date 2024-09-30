import { Request, Response } from 'express';
import { isTfmPaymentReconciliationFeatureFlagEnabled } from '@ukef/dtfs2-common';
import api from '../../api';
import { getIsoMonth } from '../../helpers/date';
import { getReportReconciliationSummariesViewModel, isPDCReadUser } from './helpers';
import { asUserSession } from '../../helpers/express-session';
import { PRIMARY_NAVIGATION_KEYS } from '../../constants';
import { UtilisationReportsViewModel } from '../../types/view-models';

const renderUtilisationReportsPage = (res: Response, viewModel: UtilisationReportsViewModel) => {
  if (!isTfmPaymentReconciliationFeatureFlagEnabled()) {
    return res.render('utilisation-reports/utilisation-reports-manual-reconciliation.njk', viewModel);
  }
  return res.render('utilisation-reports/utilisation-reports.njk', viewModel);
};

export const getUtilisationReports = async (req: Request, res: Response) => {
  const { userToken, user } = asUserSession(req.session);

  try {
    const currentPeriodSubmissionMonth = getIsoMonth(new Date());
    const reconciliationSummariesApiResponse = await api.getUtilisationReportsReconciliationSummary(currentPeriodSubmissionMonth, userToken);
    const reconciliationSummariesViewModel = await getReportReconciliationSummariesViewModel(reconciliationSummariesApiResponse, userToken);

    return renderUtilisationReportsPage(res, {
      user,
      activePrimaryNavigation: PRIMARY_NAVIGATION_KEYS.UTILISATION_REPORTS,
      reportPeriodSummaries: reconciliationSummariesViewModel,
      isPDCReadUser: isPDCReadUser(user),
    });
  } catch (error) {
    console.error('Error rendering utilisation reports page', error);
    return res.render('_partials/problem-with-service.njk', { user });
  }
};
