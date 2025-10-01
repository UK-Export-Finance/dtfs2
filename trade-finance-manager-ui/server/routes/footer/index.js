const express = require('express');

const router = express.Router();

/**
 * @openapi
 * /accessibility-statement:
 *   get:
 *     summary: Get the accessibility statement page
 *     tags: [TFM]
 *     description: Get the accessibility statement page
 *     responses:
 *       200:
 *         description: Ok
 */
router.get('/accessibility-statement', (req, res) => res.render('accessibility-statement.njk', { user: req.session.user }));

/**
 * @openapi
 * /cookies:
 *   get:
 *     summary: Get the cookies page
 *     tags: [TFM]
 *     description: Get the cookies page
 *     responses:
 *       200:
 *         description: Ok
 */
router.get('/cookies', (req, res) => res.render('cookies.njk', { user: req.session.user }));

module.exports = router;
