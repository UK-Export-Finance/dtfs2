import { Request, Response } from 'express';
import { asString, getFormattedReportPeriodWithLongMonth } from '@ukef/dtfs2-common';
import api from '../../../api';
import { asUserSession } from '../../../helpers/express-session';
import { PRIMARY_NAVIGATION_KEYS } from '../../../constants';
import {
  mapFeeRecordPaymentGroupsToFeeRecordPaymentGroupViewModelItems,
  mapFeeRecordPaymentGroupsToPaymentDetailsViewModel,
  mapKeyingSheetToKeyingSheetViewModel,
} from '../helpers';
import { UtilisationReportReconciliationForReportViewModel } from '../../../types/view-models';
import { validateFacilityIdQuery } from './validate-facility-id-query';
import { getAndClearFieldsFromRedirectSessionData } from './get-and-clear-fields-from-redirect-session-data';
import { FeeRecordPaymentGroup } from '../../../api-response-types';
import { getIsCheckboxChecked } from './get-is-checkbox-checked';
import { getSelectedFeeRecordIdsFromQuery } from './get-selected-fee-record-ids-from-query';

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
 * @param req - The Express request object.
 * @param res - The Express response object.
 */
export const getUtilisationReportReconciliationByReportId = async (req: Request, res: Response) => {
  const { userToken, user } = asUserSession(req.session);
  const { reportId } = req.params;
  const { facilityIdQuery, selectedFeeRecordIds: selectedFeeRecordIdsQuery } = req.query;

  try {
    const facilityIdQueryString = facilityIdQuery ? asString(facilityIdQuery, 'facilityIdQuery') : undefined;

    const filterError = validateFacilityIdQuery(facilityIdQueryString, req.originalUrl);

    const { tableDataError, selectedFeeRecordIds: selectedFeeRecordIdsFromSessionData } = getAndClearFieldsFromRedirectSessionData(req);

    const selectedFeeRecordIdsQueryString = selectedFeeRecordIdsQuery ? asString(selectedFeeRecordIdsQuery, 'selectedFeeRecordIdsQuery') : undefined;

    const selectedFeeRecordIds: Set<number> =
      selectedFeeRecordIdsFromSessionData.size > 0 ? selectedFeeRecordIdsFromSessionData : getSelectedFeeRecordIdsFromQuery(selectedFeeRecordIdsQueryString);

    const isCheckboxChecked = getIsCheckboxChecked(selectedFeeRecordIds);

    const { feeRecordPaymentGroups, reportPeriod, bank, keyingSheet } = await api.getUtilisationReportReconciliationDetailsById(
      reportId,
      facilityIdQueryString,
      userToken,
    );

    const formattedReportPeriod = getFormattedReportPeriodWithLongMonth(reportPeriod);

    const enablePaymentsReceivedSorting = feeRecordPaymentGroupsHaveAtLeastOnePaymentReceived(feeRecordPaymentGroups);

    const feeRecordPaymentGroupViewModel = mapFeeRecordPaymentGroupsToFeeRecordPaymentGroupViewModelItems(feeRecordPaymentGroups, isCheckboxChecked);

    const keyingSheetViewModel = mapKeyingSheetToKeyingSheetViewModel(keyingSheet);

    const paymentDetailsViewModel = mapFeeRecordPaymentGroupsToPaymentDetailsViewModel(feeRecordPaymentGroups);

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
