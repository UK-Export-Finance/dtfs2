const express = require('express');

const userRoutes = require('./users');
const { validateToken, validateRole } = require('../middleware');

const router = express.Router();

router.use('/admin/*', [validateToken, validateRole({ role: ['admin', 'ukef_operations'] })]);
router.use('/admin/', userRoutes);

module.exports = router;
