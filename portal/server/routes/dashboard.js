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
const validateToken = require('./middleware/validate-token');

const router = express.Router();

router.use('/dashboard/*', validateToken);
router.get('/', validateToken, (req, res) => res.redirect('/dashboard/deals'));
router.get('/dashboard', async (req, res) => res.redirect('/dashboard/deals'));

/**
 * Deals
 */
router.get('/dashboard/deals', async (req, res) => {
  req.session.dashboardFilters = CONSTANTS.DASHBOARD.DEFAULT_FILTERS;

  return res.redirect('/dashboard/deals/0');
});

router.get('/dashboard/deals/clear-all-filters', removeAllDealsFilters);
router.get('/dashboard/deals/filters/remove/:fieldName/:fieldValue', removeSingleAllDealsFilter);

/**
 * Facilities
 */
router.get('/dashboard/facilities', async (req, res) => {
  req.session.dashboardFilters = CONSTANTS.DASHBOARD.DEFAULT_FILTERS;

  return res.redirect('/dashboard/facilities/0');
});

router.get('/dashboard/facilities/clear-all-filters', removeAllFacilitiesFilters);
router.get('/dashboard/facilities/filters/remove/:fieldName/:fieldValue', removeSingleAllFacilitiesFilter);

/**
 * Deals and facilities - pagination
 * - Needs to be ordered last to avoid priority issues
 */
router.get('/dashboard/deals/:page', allDeals);
router.post('/dashboard/deals/:page', allDeals);
router.get('/dashboard/facilities/:page', allFacilities);
router.post('/dashboard/facilities/:page', allFacilities);

module.exports = router;
