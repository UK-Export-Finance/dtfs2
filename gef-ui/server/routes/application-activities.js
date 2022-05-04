const express = require('express');
const { getPortalActivities } = require('../controllers/activities-controller');
const { validateToken, validateBank } = require('../middleware');

const router = express.Router();

router.get('/application-details/:dealId/activities', [validateToken, validateBank], (req, res) => getPortalActivities(req, res));

module.exports = router;
