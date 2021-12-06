const express = require('express');
const { getPortalActivities } = require('../controllers/activities-controller');
const validateToken = require('../middleware/validateToken');

const router = express.Router();

router.get('/application-details/:applicationId/activities', validateToken, (req, res) => getPortalActivities(req, res));

module.exports = router;
