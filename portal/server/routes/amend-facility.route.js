const express = require('express');
const { validateRole, validateToken } = require('./middleware');
const { USER_ROLES } = require('../constants');
const { whatDoYouNeedToChange } = require('./amend-facility/what-do-you-need-to-change');

const router = express.Router();

router.get(
  '/amend-facility/what-do-you-need-to-change',
  [validateToken, validateRole({ role: [USER_ROLES.MAKER] })],
  (req, res) => whatDoYouNeedToChange(req, res),
);

module.exports = router;
