const express = require('express');
const { thankYouFeedback } = require('../../controllers/feedback');

const router = express.Router();

/**
 * @openapi
 * /:
 *   get:
 *     summary: Get the thank you feedback page
 *     tags: [TFM]
 *     description: Get the thank you feedback page
 *     responses:
 *       200:
 *         description: Ok
 */
router.get('/', thankYouFeedback);

module.exports = router;
