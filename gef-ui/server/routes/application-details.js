const express = require('express');
const {
  applicationDetails,
  postApplicationDetails,
} = require('../controllers/application-details');
const { validateToken, validateBank } = require('../middleware');

const router = express.Router();

router.get('/application-details/:dealId', [validateToken, validateBank], (req, res) => applicationDetails(req, res));
router.post('/application-details/:dealId', [validateToken, validateBank], postApplicationDetails);

module.exports = router;
