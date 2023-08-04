const express = require('express');
const { thankYouFeedback } = require('#controllers/feedback/index.js');

const router = express.Router();

router.get('/', thankYouFeedback);

module.exports = router;
