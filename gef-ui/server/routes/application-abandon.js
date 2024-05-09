const express = require('express');
const { confirmAbandonApplication, abandonApplication } = require('../controllers/application-abandon');
const { validateRole, validateToken, validateBank } = require('../middleware');
const { MAKER } = require('../constants/roles');

const router = express.Router();

router.get('/application-details/:dealId/abandon', [validateToken, validateBank, validateRole({ role: [MAKER] })], confirmAbandonApplication);
router.post('/application-details/:dealId/abandon', [validateToken, validateBank, validateRole({ role: [MAKER] })], abandonApplication);

module.exports = router;
