const express = require('express');

const router = express.Router();

/**
 * @openapi
 * /contact:
 *   get:
 *     summary: Renders contact page.
 *     tags: [Portal]
 *     description: Renders contact page.
 *     responses:
 *       200:
 *         description: OK
 */
router.get('/contact', (req, res) => res.render('contact.njk', { user: req.session.user }));

/**
 * @openapi
 * /cookies:
 *   get:
 *     summary: Renders cookies page.
 *     tags: [Portal]
 *     description: Renders cookies page.
 *     responses:
 *       200:
 *         description: OK
 */
router.get('/cookies', (req, res) => res.render('cookies.njk', { user: req.session.user }));

/**
 * @openapi
 * /accessibility-statement:
 *   get:
 *     summary: Renders accessibility statement page.
 *     tags: [Portal]
 *     description: Renders accessibility statement page.
 *     responses:
 *       200:
 *         description: OK
 */
router.get('/accessibility-statement', (req, res) => res.render('accessibility-statement.njk', { user: req.session.user }));

module.exports = router;
