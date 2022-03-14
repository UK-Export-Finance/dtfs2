const express = require('express');
const { getFeedback, postFeedback } = require('../../controllers/feedback');

const router = express.Router();

router.get('/', getFeedback);

router.post('/', postFeedback);

module.exports = router;
