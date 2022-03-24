const express = require('express');
const { thankYouFeedback } = require('../../controllers/feedback');

const router = express.Router();

router.get('/', thankYouFeedback);

module.exports = router;
