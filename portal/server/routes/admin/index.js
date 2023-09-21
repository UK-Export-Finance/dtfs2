const express = require('express');

const userAdminRoutes = require('./users');
const { validateToken, validateRole } = require('../middleware');
const { ADMIN } = require('../../constants/roles');

const router = express.Router();

router.use('/admin/*', [validateToken, validateRole({ role: [ADMIN] })]);
router.use('/admin/', userAdminRoutes);

module.exports = router;
