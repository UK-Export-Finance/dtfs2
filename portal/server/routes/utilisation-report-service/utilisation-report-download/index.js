const express = require('express');
const { validateBankIdForUser, validateMongoId, validateToken, validateRole } = require('../../middleware');
const { PAYMENT_REPORT_OFFICER } = require('../../../constants/roles');
const { getReportDownload } = require('../../../controllers/utilisation-report-service');

const router = express.Router();

router.get(
  '/banks/:bankId/utilisation-report-download/:_id',
  [validateToken, validateRole({ role: [PAYMENT_REPORT_OFFICER] })],
  validateBankIdForUser,
  validateMongoId,
  (req, res) => getReportDownload(req, res),
);

module.exports = router;
