import { Request, Response } from 'express';
import { getFormattedReportPeriodWithLongMonth } from '@ukef/dtfs2-common';
import api from '../../../api';
import { asUserSession } from '../../../helpers/express-session';
import { PRIMARY_NAVIGATION_KEYS } from '../../../constants';
import { mapFeeRecordItemsToFeeRecordViewModelItems } from '../helpers';
import { UtilisationReportReconciliationForReportViewModel } from '../../../types/view-models';
import { getAndClearAddPaymentFieldsFromRedirectSessionData } from './get-and-clear-add-payment-fields-from-redirect-session-data';
import { FeeRecordItem } from '../../../api-response-types';

const feeRecordsHaveAtLeastOnePaymentReceived = (feeRecords: FeeRecordItem[]): boolean => feeRecords.some(({ paymentsReceived }) => paymentsReceived !== null);

const renderUtilisationReportReconciliationForReport = (res: Response, viewModel: UtilisationReportReconciliationForReportViewModel) =>
  res.render('utilisation-reports/utilisation-report-reconciliation-for-report.njk', viewModel);

export const getUtilisationReportReconciliationByReportId = async (req: Request, res: Response) => {
  const { userToken, user } = asUserSession(req.session);
  const { reportId } = req.params;

  try {
    const { addPaymentErrorSummary, isCheckboxChecked } = getAndClearAddPaymentFieldsFromRedirectSessionData(req);

    const { feeRecords, reportPeriod, bank } = await api.getUtilisationReportReconciliationDetailsById(reportId, userToken);

    const formattedReportPeriod = getFormattedReportPeriodWithLongMonth(reportPeriod);

    const feeRecordViewModel = mapFeeRecordItemsToFeeRecordViewModelItems(feeRecords, isCheckboxChecked);

    const enablePaymentsReceivedSorting = feeRecordsHaveAtLeastOnePaymentReceived(feeRecords);

    return renderUtilisationReportReconciliationForReport(res, {
      user,
      activePrimaryNavigation: PRIMARY_NAVIGATION_KEYS.UTILISATION_REPORTS,
      bank,
      formattedReportPeriod,
      reportId,
      feeRecords: feeRecordViewModel,
      enablePaymentsReceivedSorting,
      errorSummary: addPaymentErrorSummary,
    });
  } catch (error) {
    console.error(`Failed to render utilisation report with id ${reportId}`, error);
    return res.render('_partials/problem-with-service.njk', { user });
  }
};
