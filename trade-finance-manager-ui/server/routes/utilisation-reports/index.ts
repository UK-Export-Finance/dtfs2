/* eslint-disable @typescript-eslint/no-misused-promises */
import express from 'express';
import { PDC_TEAM_IDS } from '@ukef/dtfs2-common';
import { getUtilisationReports } from '../../controllers/utilisation-reports';
import { updateUtilisationReportStatus } from '../../controllers/utilisation-reports/update-utilisation-report-status';
import { validateSqlId, validateUserTeam, validateTfmPaymentReconciliationFeatureFlagIsEnabled } from '../../middleware';
import { getReportDownload } from '../../controllers/utilisation-reports/report-download';
import { getUtilisationReportReconciliationByReportId } from '../../controllers/utilisation-reports/utilisation-report-reconciliation-for-report';

export const utilisationReportsRoutes = express.Router();

utilisationReportsRoutes.get('/', validateUserTeam(Object.values(PDC_TEAM_IDS)), getUtilisationReports);

utilisationReportsRoutes.post('/', validateUserTeam([PDC_TEAM_IDS.PDC_RECONCILE]), updateUtilisationReportStatus);

utilisationReportsRoutes.get('/:id/download', validateUserTeam(Object.values(PDC_TEAM_IDS)), validateSqlId('id'), getReportDownload);

utilisationReportsRoutes.get(
  '/:reportId',
  validateTfmPaymentReconciliationFeatureFlagIsEnabled,
  validateUserTeam(Object.values(PDC_TEAM_IDS)),
  validateSqlId('reportId'),
  getUtilisationReportReconciliationByReportId,
);
