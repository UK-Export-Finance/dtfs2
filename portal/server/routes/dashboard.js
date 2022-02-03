const express = require('express');
const {
  allDeals,
  removeSingleAllDealsFilter,
  removeAllDealsFilters,
  allFacilities,
} = require('../controllers/dashboard');
const CONSTANTS = require('../constants');

const validateToken = require('./middleware/validate-token');

const router = express.Router();

router.use('/dashboard/*', validateToken);

router.get('/', validateToken, (_, res) => res.redirect('/dashboard/deals'));

router.get('/dashboard', async (req, res) => res.redirect('/dashboard/deals'));

router.get('/dashboard/deals', async (req, res) => {
  req.session.dashboardFilters = CONSTANTS.DASHBOARD_FILTERS_DEFAULT;

  return res.redirect('/dashboard/deals/0');
});

router.get('/dashboard/deals/clear-all-filters', removeAllDealsFilters);

router.get('/dashboard/deals/filters/remove/:fieldName/:fieldValue', removeSingleAllDealsFilter);

router.get('/dashboard/facilities', async (req, res) => {
  req.session.dashboardFilters = CONSTANTS.DASHBOARD_FILTERS_DEFAULT;

  return res.redirect('/dashboard/facilities/0');
});

router.get('/dashboard/facilities/:page', allFacilities);

// needs to be ordered last to avoid issues with taking priority over transaction routes
router.get('/dashboard/deals/:page', allDeals);
router.post('/dashboard/deals/:page', allDeals);

module.exports = router;
