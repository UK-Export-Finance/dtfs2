const express = require('express');
const { getFeedback, postFeedback } = require('../../controllers/feedback');

const router = express.Router();

router.get('/feedback', getFeedback);
router.post('/feedback', postFeedback);

module.exports = router;
