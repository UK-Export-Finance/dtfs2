const express = require('express');
const {
  ROLES: { PAYMENT_REPORT_OFFICER },
} = require('@ukef/dtfs2-common');
const { getPreviousReports } = require('../../../controllers/utilisation-report-service');
const { validateRole, validateToken } = require('../../middleware');

const router = express.Router();

/**
 * @openapi
 * /previous-reports:
 *   get:
 *     summary: Get previous reports
 *     tags: [Portal]
 *     description: Get previous reports
 *     parameters:
 *       - in: query
 *         name: targetYear
 *         schema:
 *           type: string
 *         description: the target year
 *     responses:
 *       200:
 *         description: Ok
 *       401:
 *         description: Unauthorised insertion
 *       500:
 *         description: Internal server error
 */
router.get('/previous-reports', [validateToken, validateRole({ role: [PAYMENT_REPORT_OFFICER] })], (req, res) => getPreviousReports(req, res));

module.exports = router;
