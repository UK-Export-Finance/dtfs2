const express = require('express');
const {
  companiesHouse,
  validateCompaniesHouse,
} = require('../controllers/companies-house');
const { validateRole, validateToken, validateBank } = require('../middleware');

const router = express.Router();

router.get('/application-details/:dealId/companies-house', [validateToken, validateBank, validateRole({ role: ['maker'] })], (req, res) => companiesHouse(req, res));
router.post('/application-details/:dealId/companies-house', [validateToken, validateBank, validateRole({ role: ['maker'] })], (req, res) => validateCompaniesHouse(req, res));

module.exports = router;
