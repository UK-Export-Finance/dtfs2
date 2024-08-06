const express = require('express');
const { facilities, createFacility } = require('../../controllers/facilities');
const { validateRole, validateToken, validateBank } = require('../../middleware');
const { MAKER } = require('../../constants/roles');

const router = express.Router();

router.get('/application-details/:dealId/facilities', [validateToken, validateBank, validateRole({ role: [MAKER] })], (req, res) => facilities(req, res));
router.get('/application-details/:dealId/facilities/:facilityId', [validateToken, validateBank, validateRole({ role: [MAKER] })], (req, res) =>
  facilities(req, res),
);
router.post('/application-details/:dealId/facilities', [validateToken, validateBank, validateRole({ role: [MAKER] })], (req, res) => createFacility(req, res));
router.post('/application-details/:dealId/facilities/:facilityId', [validateToken, validateBank, validateRole({ role: [MAKER] })], (req, res) =>
  createFacility(req, res),
);

module.exports = router;
