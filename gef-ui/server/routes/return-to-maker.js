const express = require('express');
const { getReturnToMaker, postReturnToMaker } = require('../controllers/return-to-maker');
const { validateRole, validateToken, validateBank } = require('../middleware');

const router = express.Router();

router.get(
  '/application-details/:dealId/return-to-maker',
  [validateToken, validateBank, validateRole({ role: ['checker'] })],
  getReturnToMaker,
);
router.post(
  '/application-details/:dealId/return-to-maker',
  [validateToken, validateBank, validateRole({ role: ['checker'] })],
  postReturnToMaker,
);

module.exports = router;
