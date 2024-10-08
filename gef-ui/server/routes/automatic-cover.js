const express = require('express');
const { automaticCover, validateAutomaticCover } = require('../controllers/automatic-cover');

const { validateRole, validateToken, validateBank } = require('../middleware');
const { MAKER } = require('../constants/roles');

const router = express.Router();

router.get('/application-details/:dealId/automatic-cover', [validateToken, validateBank, validateRole({ role: [MAKER] })], (req, res) =>
  automaticCover(req, res),
);
router.post('/application-details/:dealId/automatic-cover', [validateToken, validateBank, validateRole({ role: [MAKER] })], (req, res) =>
  validateAutomaticCover(req, res),
);

module.exports = router;
