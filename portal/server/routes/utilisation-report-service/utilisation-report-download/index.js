const express = require('express');
const { validateBankIdForUser, validateToken, validateRole } = require('../../middleware');
const {
  ROLES: { PAYMENT_REPORT_OFFICER },
} = require('../../../constants');
const { getReportDownload } = require('../../../controllers/utilisation-report-service');

const router = express.Router();

router.get(
  '/banks/:bankId/utilisation-report-download/:id',
  [validateToken, validateRole({ role: [PAYMENT_REPORT_OFFICER] })],
  validateBankIdForUser,
  (req, res) => getReportDownload(req, res),
);

module.exports = router;
