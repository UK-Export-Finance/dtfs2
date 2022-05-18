const express = require('express');
const { confirmAbandonApplication, abandonApplication } = require('../controllers/application-abandon');
const { validateRole, validateToken, validateBank } = require('../middleware');

const router = express.Router();

router.get('/application-details/:dealId/abandon', [validateToken, validateBank, validateRole({ role: ['maker'] })], confirmAbandonApplication);
router.post('/application-details/:dealId/abandon', [validateToken, validateBank, validateRole({ role: ['maker'] })], abandonApplication);

module.exports = router;
