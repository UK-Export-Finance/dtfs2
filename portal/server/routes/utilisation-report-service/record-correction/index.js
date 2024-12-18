const express = require('express');
const { ROLES } = require('@ukef/dtfs2-common');
const { getProvideUtilisationReportCorrection } = require('../../../controllers/utilisation-report-service/record-correction');
const { validateRole, validateToken, validateSqlId } = require('../../middleware');

const router = express.Router();

router.get(
  '/provide-utilisation-report-correction/:correctionId',
  [validateToken, validateRole({ role: [ROLES.PAYMENT_REPORT_OFFICER] })],
  validateSqlId('correctionId'),
  (req, res) => getProvideUtilisationReportCorrection(req, res),
);

module.exports = router;
