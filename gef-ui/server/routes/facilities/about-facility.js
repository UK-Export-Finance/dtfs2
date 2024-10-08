const express = require('express');
const { aboutFacility, validateAndUpdateAboutFacility } = require('../../controllers/about-facility');
const { validateRole, validateToken, validateBank } = require('../../middleware');
const { MAKER } = require('../../constants/roles');

const router = express.Router();

router.get('/application-details/:dealId/facilities/:facilityId/about-facility', [validateToken, validateBank, validateRole({ role: [MAKER] })], (req, res) =>
  aboutFacility(req, res),
);
router.post('/application-details/:dealId/facilities/:facilityId/about-facility', [validateToken, validateBank, validateRole({ role: [MAKER] })], (req, res) =>
  validateAndUpdateAboutFacility(req, res),
);

module.exports = router;
