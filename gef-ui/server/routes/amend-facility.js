const express = require('express');
const { validateRole, validateToken } = require('../middleware');
const CONSTANTS = require('../constants');
const { whatDoYouNeedToChange } = require('../controllers/amend-facility/what-do-you-need-to-change');

const router = express.Router();

router.get(
  '/amend-facility/what-do-you-need-to-change',
  [validateToken, validateRole({ role: [CONSTANTS.USER_ROLES.MAKER] })],
  (req, res) => whatDoYouNeedToChange(req, res),
);

module.exports = router;
