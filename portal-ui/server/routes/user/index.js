const express = require('express');

const userProfileRoutes = require('./profile');
const { validateToken } = require('../middleware');

const router = express.Router();

router.use('/user/*', [validateToken]);
router.use('/user/', userProfileRoutes);

module.exports = router;
