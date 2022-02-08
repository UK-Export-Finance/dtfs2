const api = require('../../../api');
const { dashboardFacilitiesFiltersQuery } = require('./facilities-filters-query');
const { facilitiesTemplateFilters: templateFilters } = require('./template-filters');
const { selectedFilters } = require('./selected-filters');
const {
  submittedFiltersArray,
  submittedFiltersObject,
} = require('../filters/helpers');
const {
  getApiData,
  requestParams,
  getFlashSuccessMessage,
} = require('../../../helpers');

const PAGESIZE = 20;
const primaryNav = 'home';
const tab = 'facilities';

const getAllFacilitiesData = async (
  userToken,
  user,
  sessionFilters,
  currentPage,
  res,
) => {
  const filtersArray = submittedFiltersArray(sessionFilters);

  const filtersQuery = dashboardFacilitiesFiltersQuery(
    filtersArray, 
    user,
  );

  const { count, facilities } = await getApiData(api.allFacilities(
    currentPage * PAGESIZE,
    PAGESIZE,
    filtersQuery,
    userToken,
  ), res);

  return {
    facilities,
    count,
    filtersArray,
  };
};
exports.getAllFacilitiesData = getAllFacilitiesData;

const getTemplateVariables = (
  user,
  sessionFilters,
  facilities,
  count,
  currentPage,
  filtersArray,
) => {
  const pages = {
    totalPages: Math.ceil(count / PAGESIZE),
    currentPage: parseInt(currentPage, 10),
    totalItems: count,
  };

  const filtersObj = submittedFiltersObject(filtersArray);

  const templateVariables = {
    user,
    primaryNav,
    tab,
    facilities,
    pages,
    filters: templateFilters(filtersObj),
    selectedFilters: selectedFilters(filtersObj),
  };

  return templateVariables;
};
exports.getTemplateVariables = getTemplateVariables;

const getDataAndTemplateVariables = async (
  userToken,
  user,
  sessionFilters,
  currentPage,
  res,
) => {
  const { facilities, count, filtersArray } = await getAllFacilitiesData(
    userToken,
    user,
    sessionFilters,
    currentPage,
    res,
  );

  const templateVariables = getTemplateVariables(
    user,
    sessionFilters,
    facilities,
    count,
    currentPage,
    filtersArray,
  );

  return templateVariables;
};
exports.getDataAndTemplateVariables = getDataAndTemplateVariables;

exports.allFacilities = async (req, res) => {
  const { userToken } = requestParams(req);
  const { user } = req.session;
  const currentPage = req.params.page;

  if (Object.keys(req.body).length) {
    req.session.dashboardFilters = req.body;
  }

  const templateVariables = await getDataAndTemplateVariables(
    userToken,
    user,
    req.session.dashboardFilters,
    currentPage,
    res,
  );

  return res.render('dashboard/facilities.njk', {
    ...templateVariables,
    successMessage: getFlashSuccessMessage(req),
  });
};
