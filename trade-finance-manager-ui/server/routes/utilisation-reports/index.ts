/* eslint-disable @typescript-eslint/no-misused-promises */
import express from 'express';
import { PDC_TEAM_IDS } from '@ukef/dtfs2-common';
import { getUtilisationReports } from '../../controllers/utilisation-reports';
import { updateUtilisationReportStatus } from '../../controllers/utilisation-reports/update-utilisation-report-status';
import {
  validateSqlId,
  validateUserTeam,
  validateTfmPaymentReconciliationFeatureFlagIsEnabled,
  validatePostAddPaymentRequestBody,
  validateTfmPaymentReconciliationFeatureFlagIsNotEnabled,
  validatePostRemoveFeesFromPaymentRequestBody,
} from '../../middleware';
import { getReportDownload } from '../../controllers/utilisation-reports/report-download';
import { getUtilisationReportReconciliationByReportId } from '../../controllers/utilisation-reports/utilisation-report-reconciliation-for-report';
import { getFindReportsByYear } from '../../controllers/utilisation-reports/find-reports-by-year';
import { addPayment } from '../../controllers/utilisation-reports/add-payment';
import { postKeyingData, postKeyingDataMarkAsDone, postKeyingDataMarkAsToDo } from '../../controllers/utilisation-reports/keying-data';
import { postCheckKeyingData } from '../../controllers/utilisation-reports/check-keying-data';
import { getEditPayment, postEditPayment } from '../../controllers/utilisation-reports/edit-payment';
import { getConfirmDeletePayment, postConfirmDeletePayment } from '../../controllers/utilisation-reports/confirm-delete-payment';
import { postRemoveFeesFromPayment } from '../../controllers/utilisation-reports/remove-fees-from-payment';

export const utilisationReportsRoutes = express.Router();

utilisationReportsRoutes.get('/', validateUserTeam(Object.values(PDC_TEAM_IDS)), getUtilisationReports);

utilisationReportsRoutes.post(
  '/',
  validateTfmPaymentReconciliationFeatureFlagIsNotEnabled,
  validateUserTeam([PDC_TEAM_IDS.PDC_RECONCILE]),
  updateUtilisationReportStatus,
);

utilisationReportsRoutes.get(
  '/:id/download',
  validateTfmPaymentReconciliationFeatureFlagIsNotEnabled,
  validateUserTeam(Object.values(PDC_TEAM_IDS)),
  validateSqlId('id'),
  getReportDownload,
);

utilisationReportsRoutes.get('/find-reports-by-year', validateUserTeam(Object.values(PDC_TEAM_IDS)), getFindReportsByYear);

utilisationReportsRoutes.get(
  '/:reportId',
  validateTfmPaymentReconciliationFeatureFlagIsEnabled,
  validateUserTeam(Object.values(PDC_TEAM_IDS)),
  validateSqlId('reportId'),
  getUtilisationReportReconciliationByReportId,
);

utilisationReportsRoutes.post(
  '/:reportId/add-payment',
  validateTfmPaymentReconciliationFeatureFlagIsEnabled,
  validateUserTeam([PDC_TEAM_IDS.PDC_RECONCILE]),
  validateSqlId('reportId'),
  validatePostAddPaymentRequestBody,
  addPayment,
);

utilisationReportsRoutes.post(
  '/:reportId/check-keying-data',
  validateTfmPaymentReconciliationFeatureFlagIsEnabled,
  validateUserTeam([PDC_TEAM_IDS.PDC_RECONCILE]),
  validateSqlId('reportId'),
  postCheckKeyingData,
);

utilisationReportsRoutes.post(
  '/:reportId/keying-data/mark-as-done',
  validateTfmPaymentReconciliationFeatureFlagIsEnabled,
  validateUserTeam([PDC_TEAM_IDS.PDC_RECONCILE]),
  validateSqlId('reportId'),
  postKeyingDataMarkAsDone,
);

utilisationReportsRoutes.post(
  '/:reportId/keying-data/mark-as-to-do',
  validateTfmPaymentReconciliationFeatureFlagIsEnabled,
  validateUserTeam([PDC_TEAM_IDS.PDC_RECONCILE]),
  validateSqlId('reportId'),
  postKeyingDataMarkAsToDo,
);

utilisationReportsRoutes.post(
  '/:reportId/keying-data',
  validateTfmPaymentReconciliationFeatureFlagIsEnabled,
  validateUserTeam([PDC_TEAM_IDS.PDC_RECONCILE]),
  validateSqlId('reportId'),
  postKeyingData,
);

utilisationReportsRoutes.get(
  '/:reportId/edit-payment/:paymentId',
  validateTfmPaymentReconciliationFeatureFlagIsEnabled,
  validateUserTeam([PDC_TEAM_IDS.PDC_RECONCILE]),
  validateSqlId('reportId'),
  validateSqlId('paymentId'),
  getEditPayment,
);

utilisationReportsRoutes.post(
  '/:reportId/edit-payment/:paymentId',
  validateTfmPaymentReconciliationFeatureFlagIsEnabled,
  validateUserTeam([PDC_TEAM_IDS.PDC_RECONCILE]),
  validateSqlId('reportId'),
  validateSqlId('paymentId'),
  postEditPayment,
);

utilisationReportsRoutes.get(
  '/:reportId/edit-payment/:paymentId/confirm-delete',
  validateTfmPaymentReconciliationFeatureFlagIsEnabled,
  validateUserTeam([PDC_TEAM_IDS.PDC_RECONCILE]),
  validateSqlId('reportId'),
  validateSqlId('paymentId'),
  getConfirmDeletePayment,
);

utilisationReportsRoutes.post(
  '/:reportId/edit-payment/:paymentId/confirm-delete',
  validateTfmPaymentReconciliationFeatureFlagIsEnabled,
  validateUserTeam([PDC_TEAM_IDS.PDC_RECONCILE]),
  validateSqlId('reportId'),
  validateSqlId('paymentId'),
  postConfirmDeletePayment,
);

utilisationReportsRoutes.post(
  '/:reportId/edit-payment/:paymentId/remove-selected-fees',
  validateTfmPaymentReconciliationFeatureFlagIsEnabled,
  validateUserTeam([PDC_TEAM_IDS.PDC_RECONCILE]),
  validateSqlId('reportId'),
  validateSqlId('paymentId'),
  validatePostRemoveFeesFromPaymentRequestBody,
  postRemoveFeesFromPayment,
);
