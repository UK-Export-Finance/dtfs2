const api = require('../../api');
const { STATUS } = require('../../constants');
const dashboardFiltersQuery = require('./filters/query');
const { dashboardFilters } = require('./dashboardFilters');
const { selectedDashboardFilters } = require('./selectedDashboardFilters');
const {
  submittedFiltersArray,
  submittedFiltersObject,
} = require('./filters/helpers');
const {
  getApiData,
  requestParams,
  getFlashSuccessMessage,
} = require('../../helpers');

const PAGESIZE = 20;
const primaryNav = 'home';

exports.allDeals = async (req, res) => {
  const tab = 'deals';
  const { userToken } = requestParams(req);

  const filtersArray = submittedFiltersArray(req.body);

  const filtersQuery = dashboardFiltersQuery(
    req.body.createdByYou,
    filtersArray,
    req.session.user,
  );

  console.log('---- filtersQuery\n', filtersQuery);

  const { count, deals } = await getApiData(api.allDeals(
    req.params.page * PAGESIZE,
    PAGESIZE,
    filtersQuery,
    userToken,
  ), res);

  const pages = {
    totalPages: Math.ceil(count / PAGESIZE),
    currentPage: parseInt(req.params.page, 10),
    totalItems: count,
  };

  const filtersObj = submittedFiltersObject(filtersArray);

  return res.render('dashboard/deals.njk', {
    deals,
    pages,
    filters: dashboardFilters(filtersObj),
    selectedFilters: selectedDashboardFilters(filtersObj),
    successMessage: getFlashSuccessMessage(req),
    primaryNav,
    tab,
    user: req.session.user,
    createdByYou: req.body.createdByYou,
  });
};
