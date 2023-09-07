const express = require('express');

const userRoutes = require('./users');
const { validateToken, validateRole } = require('../middleware');
const { ADMIN, UKEF_OPERATIONS } = require('../../constants/roles');

const router = express.Router();

router.use('/admin/*', [validateToken, validateRole({ role: [ADMIN, UKEF_OPERATIONS] })]);
router.use('/admin/', userRoutes);

module.exports = router;
