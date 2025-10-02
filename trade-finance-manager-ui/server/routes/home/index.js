const express = require('express');
const { getUserHomepage } = require('../../controllers/home');

const router = express.Router();

/**
 * @openapi
 * /:
 *   get:
 *     summary: Get user home page
 *     tags: [TFM]
 *     description: Get user home page
 *     responses:
 *       301:
 *         description: Resource permanently moved
 */
router.get('/', getUserHomepage);

module.exports = router;
