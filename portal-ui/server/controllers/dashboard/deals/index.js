const api = require('../../../api');
const { dashboardDealsFiltersQuery } = require('./deals-filters-query');
const { dealsTemplateFilters: templateFilters } = require('./template-filters');
const { selectedFilters } = require('./selected-filters');
const { submittedFiltersArray, submittedFiltersObject, filtersToText } = require('../filters/helpers');
const { dashboardSortQuery } = require('../sort/helpers');
const { removeSessionFilter } = require('../filters/remove-filter-from-session');
const { getApiData, requestParams, getFlashSuccessMessage } = require('../../../helpers');
const CONSTANTS = require('../../../constants');

const { PAGE_SIZE } = CONSTANTS.DASHBOARD;

const getAllDealsData = async (userToken, user, sessionFilters, currentPage, sortBy, res) => {
  const filtersArray = submittedFiltersArray(sessionFilters);

  const filtersQuery = await dashboardDealsFiltersQuery(filtersArray, user, userToken);

  const sortQuery = dashboardSortQuery(sortBy);

  const { count, deals } = await getApiData(api.allDeals(currentPage * PAGE_SIZE, PAGE_SIZE, filtersQuery, userToken, sortQuery), res);

  return {
    deals,
    count,
    filtersArray,
  };
};
exports.getAllDealsData = getAllDealsData;

const getTemplateVariables = (user, sessionFilters, deals, count, currentPage, filtersArray) => {
  const pages = {
    totalPages: Math.ceil(count / PAGE_SIZE),
    currentPage: parseInt(currentPage, 10),
    totalItems: count,
  };

  const filtersObj = submittedFiltersObject(filtersArray);

  const templateVariables = {
    user,
    primaryNav: CONSTANTS.DASHBOARD.PRIMARY_NAV,
    tab: CONSTANTS.DASHBOARD.TABS.DEALS,
    deals,
    pages,
    filters: templateFilters(filtersObj),
    selectedFilters: selectedFilters(filtersObj),
    keyword: sessionFilters.keyword,
  };

  return templateVariables;
};
exports.getTemplateVariables = getTemplateVariables;

const getDataAndTemplateVariables = async (userToken, user, sessionFilters, currentPage, sortBy, res) => {
  const { deals, count, filtersArray } = await getAllDealsData(userToken, user, sessionFilters, currentPage, sortBy, res);

  const templateVariables = getTemplateVariables(user, sessionFilters, deals, count, currentPage, filtersArray);

  return templateVariables;
};
exports.getDataAndTemplateVariables = getDataAndTemplateVariables;

/**
 * Renders the dashboard deals page
 *
 * @async
 * @function allDeals
 * @param {import('express').Request} req - Express request object.
 * @param {import('express').Response} res - Express response object.
 * @returns {Promise<void>} Renders the dashboard deals page with the appropriate data and template variables.
 */
exports.allDeals = async (req, res) => {
  const { userToken } = requestParams(req);
  const { user } = req.session;
  const currentPage = req.params.page;

  let activeSortByOrder = req.session.sortBy ?? CONSTANTS.SORT_BY.DEFAULT;

  if (Object.keys(req.body).length) {
    req.session.dashboardFilters = req.body;
    req.session.sortBy = req.body.sortBy ?? CONSTANTS.SORT_BY.DEFAULT;
  }

  if (req.body.sortBy) {
    if (req.body.sortBy === CONSTANTS.SORT_BY.DESCENDING) {
      activeSortByOrder = CONSTANTS.SORT_BY.DESCENDING;
      delete req.body.sortBy;
    }
    if (req.body.sortBy === CONSTANTS.SORT_BY.ASCENDING) {
      activeSortByOrder = CONSTANTS.SORT_BY.ASCENDING;
      delete req.body.sortBy;
    }
  }

  const templateVariables = await getDataAndTemplateVariables(userToken, user, req.session.dashboardFilters, currentPage, activeSortByOrder, res);

  return res.render('dashboard/deals.njk', {
    ...templateVariables,
    successMessage: getFlashSuccessMessage(req),
    selectedFiltersString: filtersToText(templateVariables.selectedFilters),
    activeSortByOrder,
  });
};

/**
 * Remove session filter and redirect to dashboard deals page sorted by updatedAt.
 *
 * @async
 * @function removeSingleAllDealsFilter
 * @param {import('express').Request} req - Express request object.
 * @param {import('express').Response} res - Express response object.
 * @returns {Promise<void>} Redirects to dashboard deals page sorted by updatedAt.
 */
exports.removeSingleAllDealsFilter = async (req, res) => {
  removeSessionFilter(req);

  return res.redirect('/dashboard/deals/0');
};

/**
 * Remove all deals filters and redirect to dashboard deals page sorted by updatedAt.
 *
 * @async
 * @function removeAllDealsFilters
 * @param {import('express').Request} req - Express request object.
 * @param {import('express').Response} res - Express response object.
 * @returns {Promise<void>} Redirects to dashboard deals page sorted by updatedAt.
 */
exports.removeAllDealsFilters = (req, res) => {
  req.session.dashboardFilters = CONSTANTS.DASHBOARD.DEFAULT_FILTERS;

  return res.redirect('/dashboard/deals/0');
};
