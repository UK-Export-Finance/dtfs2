const express = require('express');
const {
  ROLES: { MAKER, CHECKER },
} = require('@ukef/dtfs2-common');
const reportsController = require('../controllers/dashboard/reports.controller');
const { validateToken, validateRole } = require('./middleware');

const reportsRouter = express.Router();

reportsRouter.get('/reports', [validateToken, validateRole({ role: [MAKER, CHECKER] })], reportsController.getPortalReports);
reportsRouter.get(
  '/reports/review-unissued-facilities',
  [validateToken, validateRole({ role: [MAKER, CHECKER] })],
  reportsController.getUnissuedFacilitiesReport,
);
reportsRouter.get(
  '/reports/review-unconditional-decision',
  [validateToken, validateRole({ role: [MAKER, CHECKER] })],
  reportsController.getUnconditionalDecisionReport,
);
reportsRouter.get(
  '/reports/review-conditional-decision',
  [validateToken, validateRole({ role: [MAKER, CHECKER] })],
  reportsController.getConditionalDecisionReport,
);
reportsRouter.get(
  '/reports/download-unissued-facilities-report',
  [validateToken, validateRole({ role: [MAKER, CHECKER] })],
  reportsController.downloadUnissuedFacilitiesReport,
);
reportsRouter.get(
  '/reports/download-unconditional-decision-report',
  [validateToken, validateRole({ role: [MAKER, CHECKER] })],
  reportsController.downloadUnconditionalDecisionReport,
);
reportsRouter.get(
  '/reports/download-conditional-decision-report',
  [validateToken, validateRole({ role: [MAKER, CHECKER] })],
  reportsController.downloadConditionalDecisionReport,
);

module.exports = reportsRouter;
