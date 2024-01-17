const express = require('express');
const { getPortalActivities } = require('../controllers/activities-controller');
const { validateRole, validateToken, validateBank } = require('../middleware');
const { MAKER, CHECKER, READ_ONLY, ADMIN } = require('../constants/roles');

const router = express.Router();

router.get('/application-details/:dealId/activities', [validateToken, validateBank, validateRole({ role: [MAKER, CHECKER, READ_ONLY, ADMIN] })], (req, res) =>
  getPortalActivities(req, res),
);

module.exports = router;
