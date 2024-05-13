import { Request, Response } from 'express';
import { getFormattedReportPeriodWithLongMonth } from '@ukef/dtfs2-common';
import api from '../../../api';
import { asUserSession } from '../../../helpers/express-session';
import { PRIMARY_NAVIGATION_KEYS } from '../../../constants';
import { mapFeeRecordItemToFeeRecordViewModelItem } from '../helpers';

export const getUtilisationReportReconciliationByReportId = async (req: Request, res: Response) => {
  const { userToken, user } = asUserSession(req.session);
  const { reportId } = req.params;

  try {
    const utilisationReportReconciliationDetails = await api.getUtilisationReportReconciliationDetailsById(
      reportId,
      userToken,
    );

    const formattedReportPeriod = getFormattedReportPeriodWithLongMonth(
      utilisationReportReconciliationDetails.reportPeriod,
    );

    const feeRecordViewModel = utilisationReportReconciliationDetails.feeRecords.map(
      mapFeeRecordItemToFeeRecordViewModelItem,
    );

    return res.render('utilisation-reports/utilisation-report-reconciliation-for-report.njk', {
      user,
      activePrimaryNavigation: PRIMARY_NAVIGATION_KEYS.UTILISATION_REPORTS,
      bank: utilisationReportReconciliationDetails.bank,
      formattedReportPeriod,
      feeRecords: feeRecordViewModel,
    });
  } catch (error) {
    console.error(`Failed to render utilisation report with id ${reportId}`, error);
    return res.render('_partials/problem-with-service.njk', { user });
  }
};
