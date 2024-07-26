const express = require('express');
const { processCoverStartDate } = require('../../controllers/confirm-cover-start-date');
const { applicationDetails } = require('../../controllers/application-details');
const { validateRole, validateToken, validateBank } = require('../../middleware');
const { MAKER } = require('../../constants/roles');

const router = express.Router();

router.get('/application-details/:dealId/:facilityId/confirm-cover-start-date/', [validateToken, validateBank, validateRole({ role: [MAKER] })], (req, res) =>
  applicationDetails(req, res),
);
router.post('/application-details/:dealId/:facilityId/confirm-cover-start-date/', [validateToken, validateBank, validateRole({ role: [MAKER] })], (req, res) =>
  processCoverStartDate(req, res),
);

module.exports = router;
