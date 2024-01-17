const express = require('express');
const { companiesHouse, validateCompaniesHouse } = require('../controllers/companies-house');
const { validateRole, validateToken, validateBank } = require('../middleware');
const { MAKER } = require('../constants/roles');

const router = express.Router();

router.get('/application-details/:dealId/companies-house', [validateToken, validateBank, validateRole({ role: [MAKER] })], (req, res) =>
  companiesHouse(req, res),
);
router.post('/application-details/:dealId/companies-house', [validateToken, validateBank, validateRole({ role: [MAKER] })], (req, res) =>
  validateCompaniesHouse(req, res),
);

module.exports = router;
