const express = require('express');

const userProfileRoutes = require('./profile');
const validateToken = require('../middleware/validate-token');

const router = express.Router();

router.use('/user/*', validateToken);

router.use(
  '/user/',
  userProfileRoutes,
);

module.exports = router;
