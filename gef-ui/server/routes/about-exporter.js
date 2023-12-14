const express = require('express');
const { aboutExporter, validateAboutExporter } = require('../controllers/about-exporter');
const { validateRole, validateToken, validateBank } = require('../middleware');
const { MAKER } = require('../constants/roles');

const router = express.Router();

router.get(
  '/application-details/:dealId/about-exporter',
  [validateToken, validateBank, validateRole({ role: [MAKER] })],
  (req, res) => aboutExporter(req, res),
);
router.post(
  '/application-details/:dealId/about-exporter',
  [validateToken, validateBank, validateRole({ role: [MAKER] })],
  (req, res) => validateAboutExporter(req, res),
);

module.exports = router;
