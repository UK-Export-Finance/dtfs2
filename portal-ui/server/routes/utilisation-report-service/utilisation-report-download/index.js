const express = require('express');
const {
  ROLES: { PAYMENT_REPORT_OFFICER },
} = require('@ukef/dtfs2-common');
const { validateBankIdForUser, validateToken, validateRole, validateSqlId } = require('../../middleware');
const { getReportDownload } = require('../../../controllers/utilisation-report-service');

const router = express.Router();

/**
 * @openapi
 * /banks/:bankId/utilisation-report-download/:id:
 *   get:
 *     summary: Fetches a utilisation report CSV file for download
 *     tags: [Portal]
 *     description: Fetches a utilisation report CSV file for download
 *     parameters:
 *       - in: path
 *         name: bankId, id
 *         schema:
 *           type: string
 *         description: the bank ID and utilisation report id
 *     responses:
 *       200:
 *         description: Ok
 *       401:
 *         description: Unauthorised insertion
 *       400:
 *         description: Bad request
 *       404:
 *         description: Not Found
 *       500:
 *         description: Internal server error
 */
router.get(
  '/banks/:bankId/utilisation-report-download/:id',
  [validateToken, validateRole({ role: [PAYMENT_REPORT_OFFICER] })],
  validateBankIdForUser,
  validateSqlId('id'),
  (req, res) => getReportDownload(req, res),
);

module.exports = router;
