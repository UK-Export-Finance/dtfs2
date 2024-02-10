const express = require('express');

const userAdminRoutes = require('./users');
const { validateToken, validateRole } = require('../middleware');
const { ROLES: { ADMIN } } = require('../../constants');

const router = express.Router();

router.use('/admin/*', [validateToken, validateRole({ role: [ADMIN] })]);
router.use('/admin/', userAdminRoutes);

module.exports = router;
