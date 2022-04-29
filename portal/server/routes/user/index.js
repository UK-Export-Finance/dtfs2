const express = require('express');

const userProfileRoutes = require('./profile');
const { validateToken, validateBank } = require('../middleware');

const router = express.Router();

router.use('/user/*', [validateToken, validateBank]);
router.use('/user/', userProfileRoutes);

module.exports = router;
