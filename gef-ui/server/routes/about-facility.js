const express = require('express');
const { aboutFacility, validateAboutFacility } = require('../controllers/about-facility');
const { validateRole, validateToken, validateBank } = require('../middleware');

const router = express.Router();

router.get('/application-details/:dealId/facilities/:facilityId/about-facility', [validateToken, validateBank, validateRole({ role: ['maker'] })], (req, res) => aboutFacility(req, res));
router.post('/application-details/:dealId/facilities/:facilityId/about-facility', [validateToken, validateBank, validateRole({ role: ['maker'] })], (req, res) => validateAboutFacility(req, res));

module.exports = router;
