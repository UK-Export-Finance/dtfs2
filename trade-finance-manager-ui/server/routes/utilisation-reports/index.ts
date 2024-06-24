/* eslint-disable @typescript-eslint/no-misused-promises */
import express from 'express';
import { PDC_TEAM_IDS } from '@ukef/dtfs2-common';
import { getUtilisationReports } from '../../controllers/utilisation-reports';
import { updateUtilisationReportStatus } from '../../controllers/utilisation-reports/update-utilisation-report-status';
import { validateSqlId, validateUserTeam, validateTfmPaymentReconciliationFeatureFlagIsEnabled, validatePostAddPaymentRequestBody } from '../../middleware';
import { getReportDownload } from '../../controllers/utilisation-reports/report-download';
import { getUtilisationReportReconciliationByReportId } from '../../controllers/utilisation-reports/utilisation-report-reconciliation-for-report';
import { getFindReportsByYear } from '../../controllers/utilisation-reports/find-reports-by-year';
import { addPayment } from '../../controllers/utilisation-reports/add-payment';
import { postKeyingData } from '../../controllers/utilisation-reports/keying-data';
import { postCheckKeyingData } from '../../controllers/utilisation-reports/check-keying-data';

export const utilisationReportsRoutes = express.Router();

utilisationReportsRoutes.get('/', validateUserTeam(Object.values(PDC_TEAM_IDS)), getUtilisationReports);

utilisationReportsRoutes.post('/', validateUserTeam([PDC_TEAM_IDS.PDC_RECONCILE]), updateUtilisationReportStatus);

utilisationReportsRoutes.get('/:id/download', validateUserTeam(Object.values(PDC_TEAM_IDS)), validateSqlId('id'), getReportDownload);

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
  validateUserTeam(Object.values(PDC_TEAM_IDS)),
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
  '/:reportId/keying-data',
  validateTfmPaymentReconciliationFeatureFlagIsEnabled,
  validateUserTeam([PDC_TEAM_IDS.PDC_RECONCILE]),
  validateSqlId('reportId'),
  postKeyingData,
);
