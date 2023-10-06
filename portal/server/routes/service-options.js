const express = require('express');
const { validateToken } = require('./middleware');
const { getServiceOptions } = require('../controllers/service-options');

const router = express.Router();

router.get('/', validateToken, (req, res) => res.redirect('/service-options'));
router.get('/service-options', validateToken, (req, res) => getServiceOptions(req, res));

module.exports = router;
