const express = require('express');
const {
  getReturnToMaker,
  postReturnToMaker,
} = require('../controllers/return-to-maker');
const validateToken = require('../middleware/validateToken');

const router = express.Router();

router.get('/application-details/:dealId/return-to-maker', validateToken, getReturnToMaker);
router.post('/application-details/:dealId/return-to-maker', validateToken, postReturnToMaker);

module.exports = router;
