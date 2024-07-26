const express = require('express');
const { applicationDetails } = require('../../controllers/application-details');
const { validateRole, validateToken, validateBank } = require('../../middleware');
const { MAKER } = require('../../constants/roles');

const router = express.Router();

router.get('/application-details/:dealId/cover-start-date', [validateToken, validateBank, validateRole({ role: [MAKER] })], (req, res) =>
  applicationDetails(req, res),
);

module.exports = router;
