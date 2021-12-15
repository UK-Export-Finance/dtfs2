const express = require('express');
const {
  applicationDetails,
  postApplicationDetails,
} = require('../controllers/application-details');
const validateToken = require('../middleware/validateToken');

const router = express.Router();

router.get('/application-details/:dealId', validateToken, (req, res) => applicationDetails(req, res));
router.post('/application-details/:dealId', validateToken, postApplicationDetails);

module.exports = router;
