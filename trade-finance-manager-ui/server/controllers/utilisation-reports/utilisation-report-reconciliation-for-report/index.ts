import { Request, Response } from 'express';
import { getFormattedReportPeriodWithLongMonth } from '@ukef/dtfs2-common';
import api from '../../../api';
import { asUserSession } from '../../../helpers/express-session';
import { PRIMARY_NAVIGATION_KEYS } from '../../../constants';
import { mapFeeRecordItemsToFeeRecordViewModelItems } from '../helpers';
import { UtilisationReportReconciliationForReportViewModel } from '../../../types/view-models';
import { getAndClearAddPaymentFieldsFromRedirectSessionData } from './get-and-clear-add-payment-fields-from-redirect-session-data';

const renderUtilisationReportReconciliationForReport = (res: Response, viewModel: UtilisationReportReconciliationForReportViewModel) =>
  res.render('utilisation-reports/utilisation-report-reconciliation-for-report.njk', viewModel);

export const getUtilisationReportReconciliationByReportId = async (req: Request, res: Response) => {
  const { userToken, user } = asUserSession(req.session);
  const { reportId } = req.params;

  try {
    const { addPaymentErrorSummary, isCheckboxChecked } = getAndClearAddPaymentFieldsFromRedirectSessionData(req);

    const utilisationReportReconciliationDetails = await api.getUtilisationReportReconciliationDetailsById(reportId, userToken);

    const formattedReportPeriod = getFormattedReportPeriodWithLongMonth(utilisationReportReconciliationDetails.reportPeriod);

    const feeRecordViewModel = mapFeeRecordItemsToFeeRecordViewModelItems(utilisationReportReconciliationDetails.feeRecords, isCheckboxChecked);

    return renderUtilisationReportReconciliationForReport(res, {
      user,
      activePrimaryNavigation: PRIMARY_NAVIGATION_KEYS.UTILISATION_REPORTS,
      bank: utilisationReportReconciliationDetails.bank,
      formattedReportPeriod,
      reportId: utilisationReportReconciliationDetails.reportId,
      feeRecords: feeRecordViewModel,
      errorSummary: addPaymentErrorSummary,
    });
  } catch (error) {
    console.error(`Failed to render utilisation report with id ${reportId}`, error);
    return res.render('_partials/problem-with-service.njk', { user });
  }
};
