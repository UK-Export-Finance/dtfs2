import { Response } from 'express';
import { CustomExpressRequest, getFormattedReportPeriodWithLongMonth, isFeeRecordCorrectionFeatureFlagEnabled } from '@ukef/dtfs2-common';
import api from '../../../api';
import { asUserSession } from '../../../helpers/express-session';
import { PRIMARY_NAVIGATION_KEYS } from '../../../constants';
import {
  mapPremiumPaymentsToViewModelItems,
  mapPaymentDetailsGroupsToPaymentDetailsViewModel,
  mapKeyingSheetToKeyingSheetViewModel,
  mapPaymentDetailsFiltersToViewModel,
  premiumPaymentsHasSelectableItems,
} from '../helpers';
import { PaymentDetailsViewModel, UtilisationReportReconciliationForReportViewModel } from '../../../types/view-models';
import { PremiumPaymentsGroup } from '../../../api-response-types';
import { extractQueryAndSessionData } from './extract-query-and-session-data';
import { mapToUtilisationDetailsViewModel } from '../helpers/utilisation-details-helper';
import { mapToRecordCorrectionViewModel } from '../helpers/record-correction-helpers';
import { mapToSelectedPaymentDetailsFiltersViewModel } from './map-to-selected-payment-details-filters-view-model';

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

const premiumPaymentsGroupsHaveAtLeastOnePaymentReceived = (premiumPaymentsGroups: PremiumPaymentsGroup[]): boolean =>
  premiumPaymentsGroups.some(({ paymentsReceived }) => paymentsReceived !== null);

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

    const { addPaymentErrorKey, generateKeyingDataErrorKey, initiateRecordCorrectionRequestErrorKey, checkedCheckboxIds } = req.session;

    delete req.session.addPaymentErrorKey;
    delete req.session.checkedCheckboxIds;
    delete req.session.generateKeyingDataErrorKey;
    delete req.session.initiateRecordCorrectionRequestErrorKey;

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
      { addPaymentErrorKey, generateKeyingDataErrorKey, initiateRecordCorrectionRequestErrorKey, checkedCheckboxIds },
      req.originalUrl,
    );

    const { premiumPayments, paymentDetails, reportPeriod, bank, keyingSheet, utilisationDetails, recordCorrectionDetails } =
      await api.getUtilisationReportReconciliationDetailsById(reportId, premiumPaymentsFilters, paymentDetailsFilters, userToken);

    const formattedReportPeriod = getFormattedReportPeriodWithLongMonth(reportPeriod);

    const enablePaymentsReceivedSorting = premiumPaymentsGroupsHaveAtLeastOnePaymentReceived(premiumPayments);

    const premiumPaymentsItems = mapPremiumPaymentsToViewModelItems(premiumPayments, isCheckboxChecked);

    const premiumPaymentsViewModel = {
      payments: premiumPaymentsItems,
      filters: premiumPaymentsFilters,
      filterError: premiumPaymentsFilterError,
      tableDataError: premiumPaymentsTableDataError,
      enablePaymentsReceivedSorting,
      showMatchSuccessNotification: matchSuccess === 'true',
      hasSelectableRows: premiumPaymentsHasSelectableItems(premiumPaymentsItems),
    };

    const keyingSheetViewModel = mapKeyingSheetToKeyingSheetViewModel(keyingSheet);

    const paymentDetailsFiltersViewModel = mapPaymentDetailsFiltersToViewModel(paymentDetailsFilters);

    const paymentDetailsViewModel: PaymentDetailsViewModel = {
      rows: mapPaymentDetailsGroupsToPaymentDetailsViewModel(paymentDetails),
      filters: paymentDetailsFiltersViewModel,
      filterErrors: paymentDetailsFilterErrors,
      isFilterActive: isPaymentDetailsFilterActive,
      selectedFilters: mapToSelectedPaymentDetailsFiltersViewModel(paymentDetailsFilters, reportId),
    };

    const utilisationDetailsViewModel = mapToUtilisationDetailsViewModel(utilisationDetails, reportId);

    const recordCorrectionViewModel = mapToRecordCorrectionViewModel(recordCorrectionDetails);

    const viewModel: UtilisationReportReconciliationForReportViewModel = {
      user,
      activePrimaryNavigation: PRIMARY_NAVIGATION_KEYS.UTILISATION_REPORTS,
      bank,
      formattedReportPeriod,
      reportId,
      premiumPayments: premiumPaymentsViewModel,
      paymentDetails: paymentDetailsViewModel,
      utilisationDetails: utilisationDetailsViewModel,
      recordCorrectionDetails: recordCorrectionViewModel,
      keyingSheet: keyingSheetViewModel,
      isFeeRecordCorrectionFeatureFlagEnabled: isFeeRecordCorrectionFeatureFlagEnabled(),
    };

    return res.render('utilisation-reports/utilisation-report-reconciliation-for-report.njk', viewModel);
  } catch (error) {
    console.error('Failed to render utilisation report with id %s: %o', reportId, error);
    return res.render('_partials/problem-with-service.njk', { user });
  }
};
