const express = require('express');

const userRoutes = require('./users');
const { validate } = require('../role-validator');
const validateToken = require('../middleware/validate-token');

const router = express.Router();

router.use('/admin/*', validateToken);

router.use(
  '/admin/',
  validate({ role: ['admin', 'ukef_operations'] }),
  userRoutes,
);

module.exports = router;
