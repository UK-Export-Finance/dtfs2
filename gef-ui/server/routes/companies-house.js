const express = require('express');
const {
  companiesHouse,
  validateCompaniesHouse,
} = require('../controllers/companies-house');
const validateToken = require('../middleware/validateToken');

const router = express.Router();

router.get('/application-details/:dealId/companies-house', validateToken, (req, res) => companiesHouse(req, res));
router.post('/application-details/:dealId/companies-house', validateToken, (req, res) => validateCompaniesHouse(req, res));

module.exports = router;
