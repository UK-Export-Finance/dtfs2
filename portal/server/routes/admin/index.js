const express = require('express');

const userRoutes = require('./users');
const { validateToken, validateRole } = require('../middleware');

const router = express.Router();

router.use('/admin/*', validateToken);
router.use('/admin/', validateRole({ role: ['admin', 'ukef_operations'] }), userRoutes);

module.exports = router;
