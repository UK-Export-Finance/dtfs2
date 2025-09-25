const express = require('express');
const {
  ROLES: { MAKER, CHECKER },
} = require('@ukef/dtfs2-common');
const reportsController = require('../controllers/dashboard/reports.controller');
const { validateToken, validateRole } = require('./middleware');

const reportsRouter = express.Router();

/**
 * @openapi
 * /reports:
 *   get:
 *     summary: Get the reports dashboard with summary counts for facilities and UKEF decisions.
 *     tags: [Portal]
 *     description: Get the reports dashboard with summary counts for facilities and UKEF decisions.
 *     responses:
 *       200:
 *         description: OK
 *       400:
 *         description: Bad request
 *       401:
 *         description: Unauthorised insertion
 *       403:
 *         description: Forbidden
 *       500:
 *         description: Internal server error
 */
reportsRouter.get('/reports', [validateToken, validateRole({ role: [MAKER, CHECKER] })], reportsController.getPortalReports);

/**
 * @openapi
 * /reports/review-unissued-facilities:
 *   get:
 *     summary: GET unissued facilities report
 *     tags: [Portal]
 *     description: GET unissued facilities report
 *     responses:
 *       200:
 *         description: OK
 *       400:
 *         description: Bad request
 *       401:
 *         description: Unauthorised insertion
 *       403:
 *         description: Forbidden
 *       500:
 *         description: Internal server error
 */
reportsRouter.get(
  '/reports/review-unissued-facilities',
  [validateToken, validateRole({ role: [MAKER, CHECKER] })],
  reportsController.getUnissuedFacilitiesReport,
);

/**
 * @openapi
 * /reports/review-unconditional-decision:
 *   get:
 *     summary: GET unconditional decision report
 *     tags: [Portal]
 *     description: GET unconditional decision report
 *     responses:
 *       200:
 *         description: OK
 *       400:
 *         description: Bad request
 *       401:
 *         description: Unauthorised insertion
 *       403:
 *         description: Forbidden
 *       500:
 *         description: Internal server error
 */
reportsRouter.get(
  '/reports/review-unconditional-decision',
  [validateToken, validateRole({ role: [MAKER, CHECKER] })],
  reportsController.getUnconditionalDecisionReport,
);

/**
 * @openapi
 * /reports/review-conditional-decision:
 *   get:
 *     summary: GET conditional decision report
 *     tags: [Portal]
 *     description: GET conditional decision report
 *     responses:
 *       200:
 *         description: OK
 *       400:
 *         description: Bad request
 *       401:
 *         description: Unauthorised insertion
 *       403:
 *         description: Forbidden
 *       500:
 *         description: Internal server error
 */
reportsRouter.get(
  '/reports/review-conditional-decision',
  [validateToken, validateRole({ role: [MAKER, CHECKER] })],
  reportsController.getConditionalDecisionReport,
);

/**
 * @openapi
 * /reports/download-unissued-facilities-report:
 *   get:
 *     summary: Download the unissued facility report
 *     tags: [Portal]
 *     description: Download the unissued facility report
 *     responses:
 *       200:
 *         description: OK
 *       400:
 *         description: Bad request
 *       401:
 *         description: Unauthorised insertion
 *       403:
 *         description: Forbidden
 *       500:
 *         description: Internal server error
 */
reportsRouter.get(
  '/reports/download-unissued-facilities-report',
  [validateToken, validateRole({ role: [MAKER, CHECKER] })],
  reportsController.downloadUnissuedFacilitiesReport,
);

/**
 * @openapi
 * /reports/download-unconditional-decision-report:
 *   get:
 *     summary: Download unconditional ukef decision report
 *     tags: [Portal]
 *     description: Download unconditional ukef decision report
 *     responses:
 *       200:
 *         description: OK
 *       400:
 *         description: Bad request
 *       401:
 *         description: Unauthorised insertion
 *       403:
 *         description: Forbidden
 *       500:
 *         description: Internal server error
 */
reportsRouter.get(
  '/reports/download-unconditional-decision-report',
  [validateToken, validateRole({ role: [MAKER, CHECKER] })],
  reportsController.downloadUnconditionalDecisionReport,
);

/**
 * @openapi
 * /reports/download-conditional-decision-report:
 *   get:
 *     summary: Download conditional ukef decision report
 *     tags: [Portal]
 *     description: Download conditional ukef decision report
 *     responses:
 *       200:
 *         description: OK
 *       400:
 *         description: Bad request
 *       401:
 *         description: Unauthorised insertion
 *       403:
 *         description: Forbidden
 *       500:
 *         description: Internal server error
 */
reportsRouter.get(
  '/reports/download-conditional-decision-report',
  [validateToken, validateRole({ role: [MAKER, CHECKER] })],
  reportsController.downloadConditionalDecisionReport,
);

module.exports = reportsRouter;
