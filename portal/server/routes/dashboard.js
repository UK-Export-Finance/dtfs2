const express = require('express');
const {
  bssFacilities,
  gefFacilities,
  allDeals,
  removeAllDealsFilter,
  removeAllDealsFilters,
} = require('../controllers/dashboard');

const validateToken = require('./middleware/validate-token');

const router = express.Router();

router.use('/dashboard/*', validateToken);

router.get('/', validateToken, (_, res) => res.redirect('/dashboard/deals/0'));

router.get('/dashboard', async (req, res) => res.redirect('/dashboard/deals/0'));

router.get('/dashboard/deals', async (req, res) => res.redirect('/dashboard/deals/0'));

router.get('/dashboard/deals/clear-all-filters', removeAllDealsFilters);

router.get('/dashboard/deals/filters/remove/:fieldName/:fieldValue', removeAllDealsFilter);

router.get('/dashboard/facilities/gef', async (req, res) => res.redirect('/dashboard/facilities/gef/0'));

router.get('/dashboard/facilities/gef/:page', gefFacilities);

router.get('/dashboard/facilities', async (req, res) => res.redirect('/dashboard/facilities/0'));

router.get('/dashboard/facilities/:page', bssFacilities);

// needs to be ordered last to avoid issues with taking priority over transaction routes
router.get('/dashboard/deals/:page', allDeals);
router.post('/dashboard/deals/:page', allDeals);

module.exports = router;
