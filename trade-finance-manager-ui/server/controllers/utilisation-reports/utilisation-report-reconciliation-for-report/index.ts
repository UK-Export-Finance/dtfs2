import { Response } from 'express';
import { CustomExpressRequest, getFormattedReportPeriodWithLongMonth, UtilisationReportPremiumPaymentsFilters } from '@ukef/dtfs2-common';
import api from '../../../api';
import { asUserSession } from '../../../helpers/express-session';
import { PRIMARY_NAVIGATION_KEYS } from '../../../constants';
import {
  mapFeeRecordPaymentGroupsToFeeRecordPaymentGroupViewModelItems,
  mapFeeRecordPaymentGroupsToPaymentDetailsViewModel,
  mapKeyingSheetToKeyingSheetViewModel,
} from '../helpers';
import { UtilisationReportReconciliationForReportViewModel } from '../../../types/view-models';
import { FeeRecordPaymentGroup } from '../../../api-response-types';
import { extractQueryAndSessionData } from './extract-query-and-session-data';

export type GetUtilisationReportReconciliationRequest = CustomExpressRequest<{
  query: {
    facilityIdQuery?: string;
    selectedFeeRecordIds?: string;
  };
}>;

const feeRecordPaymentGroupsHaveAtLeastOnePaymentReceived = (feeRecordPaymentGroups: FeeRecordPaymentGroup[]): boolean =>
  feeRecordPaymentGroups.some(({ paymentsReceived }) => paymentsReceived !== null);

const renderUtilisationReportReconciliationForReport = (res: Response, viewModel: UtilisationReportReconciliationForReportViewModel) =>
  res.render('utilisation-reports/utilisation-report-reconciliation-for-report.njk', viewModel);

/**
 * Controller for the GET utilisation report reconciliation for report route.
 *
 * Retrieves report details associated with the provided utilisation report ID
 * and maps these to view models.
 *
 * Checks fee record checkboxes based on selected IDs from session or query
 * parameters. These may have been set if the user was redirected from another
 * page.
 *
 * Deletes any related session data after processing.
 *
 * @param req - The request object
 * @param res - The response object
 */
export const getUtilisationReportReconciliationByReportId = async (req: GetUtilisationReportReconciliationRequest, res: Response) => {
  const { userToken, user } = asUserSession(req.session);
  const { reportId } = req.params;

  try {
    const { facilityIdQuery, selectedFeeRecordIds: selectedFeeRecordIdsQuery } = req.query;

    const { addPaymentErrorKey, generateKeyingDataErrorKey, checkedCheckboxIds } = req.session;

    delete req.session.addPaymentErrorKey;
    delete req.session.checkedCheckboxIds;
    delete req.session.generateKeyingDataErrorKey;

    const { facilityIdQueryString, filterError, tableDataError, isCheckboxChecked } = extractQueryAndSessionData(
      { facilityIdQuery, selectedFeeRecordIdsQuery },
      { addPaymentErrorKey, generateKeyingDataErrorKey, checkedCheckboxIds },
      req.originalUrl,
    );

    const premiumPaymentsTabFilters: UtilisationReportPremiumPaymentsFilters = {
      facilityId: facilityIdQueryString,
    };

    const { premiumPayments, paymentDetails, reportPeriod, bank, keyingSheet } = await api.getUtilisationReportReconciliationDetailsById(
      reportId,
      premiumPaymentsTabFilters,
      userToken,
    );

    const formattedReportPeriod = getFormattedReportPeriodWithLongMonth(reportPeriod);

    const enablePaymentsReceivedSorting = feeRecordPaymentGroupsHaveAtLeastOnePaymentReceived(premiumPayments);

    const feeRecordPaymentGroupViewModel = mapFeeRecordPaymentGroupsToFeeRecordPaymentGroupViewModelItems(premiumPayments, isCheckboxChecked);

    const keyingSheetViewModel = mapKeyingSheetToKeyingSheetViewModel(keyingSheet);

    const paymentDetailsViewModel = mapFeeRecordPaymentGroupsToPaymentDetailsViewModel(paymentDetails);

    return renderUtilisationReportReconciliationForReport(res, {
      user,
      activePrimaryNavigation: PRIMARY_NAVIGATION_KEYS.UTILISATION_REPORTS,
      bank,
      formattedReportPeriod,
      reportId,
      enablePaymentsReceivedSorting,
      feeRecordPaymentGroups: feeRecordPaymentGroupViewModel,
      tableDataError,
      filterError,
      facilityIdQuery: facilityIdQueryString,
      keyingSheet: keyingSheetViewModel,
      paymentDetails: paymentDetailsViewModel,
    });
  } catch (error) {
    console.error(`Failed to render utilisation report with id ${reportId}`, error);
    return res.render('_partials/problem-with-service.njk', { user });
  }
};
