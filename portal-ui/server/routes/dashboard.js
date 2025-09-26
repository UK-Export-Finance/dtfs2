const express = require('express');
const {
  allDeals,
  removeSingleAllDealsFilter,
  removeAllDealsFilters,
  allFacilities,
  removeSingleAllFacilitiesFilter,
  removeAllFacilitiesFilters,
} = require('../controllers/dashboard');
const CONSTANTS = require('../constants');
const { validateToken } = require('./middleware');

const router = express.Router();

router.use('/dashboard/*', validateToken);

/**
 * @openapi
 * /dashboard:
 *   get:
 *     summary: Redirects to dashboard deals page.
 *     tags: [Portal]
 *     description: Redirects to dashboard deals page.
 *     responses:
 *       301:
 *         description: Resource moved permanently
 */
router.get('/dashboard', async (req, res) => res.redirect('/dashboard/deals'));

/**
 * @openapi
 * /dashboard/deals:
 *   get:
 *     summary: Redirects to dashboard deals page sorted by updatedAt.
 *     tags: [Portal]
 *     description: Redirects to dashboard deals page sorted by updatedAt.
 *     responses:
 *       301:
 *         description: Resource moved permanently
 */
router.get('/dashboard/deals', async (req, res) => {
  req.session.dashboardFilters = CONSTANTS.DASHBOARD.DEFAULT_FILTERS;
  req.session.sortBy = CONSTANTS.DASHBOARD.DEFAULT_SORT;

  return res.redirect('/dashboard/deals/0');
});

/**
 * @openapi
 * /dashboard/deals/clear-all-filters:
 *   get:
 *     summary: Remove all deals filters and redirect to dashboard deals page sorted by updatedAt.
 *     tags: [Portal]
 *     description: Remove all deals filters and redirect to dashboard deals page sorted by updatedAt.
 *     responses:
 *       301:
 *         description: Resource moved permanently
 */
router.get('/dashboard/deals/clear-all-filters', removeAllDealsFilters);

/**
 * @openapi
 * /dashboard/deals/filters/remove/:fieldName/:fieldValue:
 *   get:
 *     summary: Remove session filter and redirect to dashboard deals page sorted by updatedAt.
 *     tags: [Portal]
 *     description: Remove session filter and redirect to dashboard deals page sorted by updatedAt.
 *     parameters:
 *       - in: path
 *         name: fieldName, fieldValue
 *         schema:
 *           type: string
 *         required: true
 *         description: the fieldName and fieldValue
 *     responses:
 *       301:
 *         description: Resource moved permanently
 */
router.get('/dashboard/deals/filters/remove/:fieldName/:fieldValue', removeSingleAllDealsFilter);

/**
 * @openapi
 * /dashboard/facilities:
 *   get:
 *     summary: Add default session filter and redirect to dashboard deals page sorted by updatedAt.
 *     tags: [Portal]
 *     description: Add default session filter and redirect to dashboard deals page sorted by updatedAt.
 *     responses:
 *       301:
 *         description: Resource moved permanently
 */
router.get('/dashboard/facilities', async (req, res) => {
  req.session.dashboardFilters = CONSTANTS.DASHBOARD.DEFAULT_FILTERS;
  req.session.sortBy = CONSTANTS.DASHBOARD.DEFAULT_SORT;

  return res.redirect('/dashboard/facilities/0');
});

/**
 * @openapi
 * /dashboard/facilities/clear-all-filters:
 *   get:
 *     summary: Remove all facilities filters and redirect to dashboard deals page sorted by updatedAt.
 *     tags: [Portal]
 *     description: Remove all facilities filters and redirect to dashboard deals page sorted by updatedAt.
 *     responses:
 *       301:
 *         description: Resource moved permanently
 */
router.get('/dashboard/facilities/clear-all-filters', removeAllFacilitiesFilters);

/**
 * @openapi
 * /dashboard/facilities/filters/remove/:fieldName/:fieldValue:
 *   get:
 *     summary: Remove all facilities filters and redirect to dashboard deals page sorted by updatedAt.
 *     tags: [Portal]
 *     description: Remove all facilities filters and redirect to dashboard deals page sorted by updatedAt.
 *     parameters:
 *       - in: path
 *         name: fieldName, fieldValue
 *         schema:
 *           type: string
 *         required: true
 *         description: the fieldName and fieldValue
 *     responses:
 *       301:
 *         description: Resource moved permanently
 */
router.get('/dashboard/facilities/filters/remove/:fieldName/:fieldValue', removeSingleAllFacilitiesFilter);

/**
 * @openapi
 * /dashboard/deals/:page:
 *   get:
 *     summary: Get the dashboard deals page
 *     tags: [Portal]
 *     description: Get the dashboard deals page
 *     parameters:
 *       - in: path
 *         name: page
 *         schema:
 *           type: string
 *         required: true
 *         description: page number
 *     responses:
 *       200:
 *         description: OK
 *       400:
 *         description: Bad request
 *       404:
 *         description: Not found
 *   post:
 *     summary: Get the dashboard deals page
 *     tags: [Portal]
 *     description: Get the dashboard deals page
 *     parameters:
 *       - in: path
 *         name: page
 *         schema:
 *           type: string
 *         required: true
 *         description: page number
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *     responses:
 *       200:
 *         description: OK
 *       400:
 *         description: Bad request
 *       404:
 *         description: Not found
 */
router.route(`/dashboard/deals/:page`).get(allDeals).post(allDeals);

/**
 * @openapi
 * /dashboard/facilities/:page:
 *   get:
 *     summary: Get the dashboard deals page
 *     tags: [Portal]
 *     description: Get the dashboard deals page
 *     parameters:
 *       - in: path
 *         name: page
 *         schema:
 *           type: string
 *         required: true
 *         description: page number
 *     responses:
 *       200:
 *         description: OK
 *       400:
 *         description: Bad request
 *       404:
 *         description: Not found
 *   post:
 *     summary: Get the dashboard facilities page
 *     tags: [Portal]
 *     description: Get the dashboard facilities page
 *     parameters:
 *       - in: path
 *         name: page
 *         schema:
 *           type: string
 *         required: true
 *         description: page number
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *     responses:
 *       200:
 *         description: OK
 *       400:
 *         description: Bad request
 *       404:
 *         description: Not found
 */
router.route(`/dashboard/facilities/:page`).get(allFacilities).post(allFacilities);

module.exports = router;
