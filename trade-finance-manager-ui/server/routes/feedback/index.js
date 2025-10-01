const express = require('express');
const { getFeedback, postFeedback } = require('../../controllers/feedback');

const router = express.Router();

/**
 * @openapi
 * /feedback:
 *   get:
 *     summary: Get the feedback form page
 *     tags: [TFM]
 *     description: Get the feedback form page
 *     responses:
 *       200:
 *         description: Ok
 *   post:
 *     summary: Post feedback
 *     tags: [TFM]
 *     description: Post feedback
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *     responses:
 *       301:
 *         description: Resource permanently moved
 *       400:
 *         description: Bad Request
 *       404:
 *         description: Not Found
 *       500:
 *         description: Internal server error
 */
router.route('/feedback').get(getFeedback).post(postFeedback);

module.exports = router;
