const express = require('express');
const { getFacilities, queryFacilities } = require('../../controllers/facilities');

const router = express.Router();

/**
 * @openapi
 * /:
 *   get:
 *     summary: Redirects to facilities page
 *     tags: [TFM]
 *     description: Redirects to facilities page
 *     responses:
 *       301:
 *         description: Resource permanently moved
 *   post:
 *     summary: Redirects to either GET /deals or GET /facilities with a query string constructed from the query
 *     tags: [TFM]
 *     description: Redirects to either GET /deals or GET /facilities with a query string constructed from the query
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *     responses:
 *       301:
 *         description: Resource permanently moved
 */
router
  .route('/')
  .get((req, res) => res.redirect('/facilities/0'))
  .post(queryFacilities);

/**
 * @openapi
 * /:pageNumber:
 *   get:
 *     summary: Get the facilities and renders the relevant page
 *     tags: [TFM]
 *     description: Get the facilities and renders the relevant page
 *     parameters:
 *       - in: path
 *         name: pageNumber
 *         schema:
 *           type: string
 *         required: true
 *         description: the page number
 *     responses:
 *       200:
 *         description: Ok
 *       400:
 *         description: Bad Request
 *       404:
 *         description: Not Found
 *       500:
 *         description: Internal server error
 *   post:
 *     summary: Get facilities with a query string constructed from the query
 *     tags: [TFM]
 *     description: Get facilities with a query string constructed from the query
 *     parameters:
 *       - in: path
 *         name: pageNumber
 *         schema:
 *           type: string
 *         required: true
 *         description: the page number
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *     responses:
 *       301:
 *         description: Resource permanently moved
 */
router.route('/:pageNumber').get(getFacilities).post(queryFacilities);

module.exports = router;
