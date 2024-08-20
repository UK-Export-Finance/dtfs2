import { Request, Response } from 'express';
import { asString, getFormattedReportPeriodWithLongMonth } from '@ukef/dtfs2-common';
import api from '../../../api';
import { asUserSession } from '../../../helpers/express-session';
import { PRIMARY_NAVIGATION_KEYS } from '../../../constants';
import { mapFeeRecordPaymentGroupsToFeeRecordPaymentGroupViewModelItems, mapKeyingSheetToKeyingSheetViewModel } from '../helpers';
import { UtilisationReportReconciliationForReportViewModel } from '../../../types/view-models';
import { validateFacilityIdQuery } from './validate-facility-id-query';
import { getAndClearFieldsFromRedirectSessionData } from './get-and-clear-fields-from-redirect-session-data';
import { FeeRecordPaymentGroup } from '../../../api-response-types';
import { getIsCheckboxCheckedFromQuery } from './get-is-checkbox-checked-from-query';

const feeRecordPaymentGroupsHaveAtLeastOnePaymentReceived = (feeRecordPaymentGroups: FeeRecordPaymentGroup[]): boolean =>
  feeRecordPaymentGroups.some(({ paymentsReceived }) => paymentsReceived !== null);

const renderUtilisationReportReconciliationForReport = (res: Response, viewModel: UtilisationReportReconciliationForReportViewModel) =>
  res.render('utilisation-reports/utilisation-report-reconciliation-for-report.njk', viewModel);

export const getUtilisationReportReconciliationByReportId = async (req: Request, res: Response) => {
  const { userToken, user } = asUserSession(req.session);
  const { reportId } = req.params;
  const { facilityIdQuery, selectedFeeRecordIds } = req.query;

  try {
    const facilityIdQueryAsString = facilityIdQuery ? asString(facilityIdQuery, 'facilityIdQuery') : undefined;
    const facilityIdQueryError = validateFacilityIdQuery(facilityIdQueryAsString, req.originalUrl);

    const selectedFeeRecordIdsAsString = selectedFeeRecordIds ? asString(selectedFeeRecordIds, 'selectedFeeRecordIds') : undefined;
    const isCheckboxCheckedQuery = getIsCheckboxCheckedFromQuery(selectedFeeRecordIdsAsString);

    const { errorSummary: premiumPaymentFormError, isCheckboxChecked: isCheckboxCheckedSession } = getAndClearFieldsFromRedirectSessionData(req);

    const isCheckboxChecked = isCheckboxCheckedQuery || isCheckboxCheckedSession;

    const { feeRecordPaymentGroups, reportPeriod, bank, keyingSheet } = await api.getUtilisationReportReconciliationDetailsById(
      reportId,
      facilityIdQueryAsString,
      userToken,
    );

    const formattedReportPeriod = getFormattedReportPeriodWithLongMonth(reportPeriod);

    const enablePaymentsReceivedSorting = feeRecordPaymentGroupsHaveAtLeastOnePaymentReceived(feeRecordPaymentGroups);

    const feeRecordPaymentGroupViewModel = mapFeeRecordPaymentGroupsToFeeRecordPaymentGroupViewModelItems(feeRecordPaymentGroups, isCheckboxChecked);

    const keyingSheetViewModel = mapKeyingSheetToKeyingSheetViewModel(keyingSheet);

    return renderUtilisationReportReconciliationForReport(res, {
      user,
      activePrimaryNavigation: PRIMARY_NAVIGATION_KEYS.UTILISATION_REPORTS,
      bank,
      formattedReportPeriod,
      reportId,
      enablePaymentsReceivedSorting,
      feeRecordPaymentGroups: feeRecordPaymentGroupViewModel,
      premiumPaymentFormError,
      facilityIdQueryError,
      facilityIdQuery: facilityIdQueryAsString,
      keyingSheet: keyingSheetViewModel,
      paymentDetails: [],
    });
  } catch (error) {
    console.error(`Failed to render utilisation report with id ${reportId}`, error);
    return res.render('_partials/problem-with-service.njk', { user });
  }
};
