const express = require('express');

const userAdminRoutes = require('./users');
const activityRoutes = require('./activity');

const { validateToken, validateRole } = require('../middleware');
const { ADMIN } = require('../../constants/roles');

const router = express.Router();

router.use('/admin/*', [validateToken, validateRole({ role: [ADMIN] })]);
router.use('/admin/', userAdminRoutes);
router.use('/admin/', activityRoutes);

module.exports = router;
