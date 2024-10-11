import { Response } from 'express';
import { CustomExpressRequest, getFormattedReportPeriodWithLongMonth } from '@ukef/dtfs2-common';
import api from '../../../api';
import { asUserSession } from '../../../helpers/express-session';
import { PRIMARY_NAVIGATION_KEYS } from '../../../constants';
import {
  mapFeeRecordPaymentGroupsToPremiumPaymentsViewModelItems,
  mapFeeRecordPaymentGroupsToPaymentDetailsViewModel,
  mapKeyingSheetToKeyingSheetViewModel,
  mapPaymentDetailsFiltersToViewModel,
} from '../helpers';
import { PaymentDetailsViewModel, UtilisationReportReconciliationForReportViewModel } from '../../../types/view-models';
import { FeeRecordPaymentGroup } from '../../../api-response-types';
import { extractQueryAndSessionData } from './extract-query-and-session-data';

export type GetUtilisationReportReconciliationRequest = CustomExpressRequest<{
  query: {
    premiumPaymentsFacilityId?: string;
    paymentDetailsFacilityId?: string;
    paymentDetailsPaymentCurrency?: string;
    paymentDetailsPaymentReference?: string;
    selectedFeeRecordIds?: string;
    matchSuccess?: string;
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
    const {
      premiumPaymentsFacilityId,
      paymentDetailsFacilityId,
      paymentDetailsPaymentReference,
      paymentDetailsPaymentCurrency,
      selectedFeeRecordIds: selectedFeeRecordIdsQuery,
      matchSuccess,
    } = req.query;

    const { addPaymentErrorKey, generateKeyingDataErrorKey, checkedCheckboxIds } = req.session;

    delete req.session.addPaymentErrorKey;
    delete req.session.checkedCheckboxIds;
    delete req.session.generateKeyingDataErrorKey;

    const {
      premiumPaymentsFilters,
      premiumPaymentsFilterError,
      premiumPaymentsTableDataError,
      paymentDetailsFilters,
      paymentDetailsFilterErrors,
      isPaymentDetailsFilterActive,
      isCheckboxChecked,
    } = extractQueryAndSessionData(
      { premiumPaymentsFacilityId, paymentDetailsFacilityId, paymentDetailsPaymentReference, paymentDetailsPaymentCurrency, selectedFeeRecordIdsQuery },
      { addPaymentErrorKey, generateKeyingDataErrorKey, checkedCheckboxIds },
      req.originalUrl,
    );

    const { premiumPayments, paymentDetails, reportPeriod, bank, keyingSheet } = await api.getUtilisationReportReconciliationDetailsById(
      reportId,
      premiumPaymentsFilters,
      paymentDetailsFilters,
      userToken,
    );

    const formattedReportPeriod = getFormattedReportPeriodWithLongMonth(reportPeriod);

    const enablePaymentsReceivedSorting = feeRecordPaymentGroupsHaveAtLeastOnePaymentReceived(premiumPayments);

    const premiumPaymentsViewModel = mapFeeRecordPaymentGroupsToPremiumPaymentsViewModelItems(premiumPayments, isCheckboxChecked);

    const keyingSheetViewModel = mapKeyingSheetToKeyingSheetViewModel(keyingSheet);

    const paymentDetailsFiltersViewModel = mapPaymentDetailsFiltersToViewModel(paymentDetailsFilters);

    const paymentDetailsViewModel: PaymentDetailsViewModel = {
      rows: mapFeeRecordPaymentGroupsToPaymentDetailsViewModel(paymentDetails),
      filters: paymentDetailsFiltersViewModel,
      filterErrors: paymentDetailsFilterErrors,
      isFilterActive: isPaymentDetailsFilterActive,
    };

    return renderUtilisationReportReconciliationForReport(res, {
      user,
      activePrimaryNavigation: PRIMARY_NAVIGATION_KEYS.UTILISATION_REPORTS,
      bank,
      formattedReportPeriod,
      reportId,
      premiumPaymentsFilters,
      premiumPaymentsFilterError,
      premiumPaymentsTableDataError,
      enablePaymentsReceivedSorting,
      premiumPayments: premiumPaymentsViewModel,
      paymentDetails: paymentDetailsViewModel,
      keyingSheet: keyingSheetViewModel,
      displayMatchSuccessNotification: matchSuccess === 'true',
    });
  } catch (error) {
    console.error(`Failed to render utilisation report with id ${reportId}`, error);
    return res.render('_partials/problem-with-service.njk', { user });
  }
};
