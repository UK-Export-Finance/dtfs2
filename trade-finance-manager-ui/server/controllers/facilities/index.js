const api = require('../../api');
const { generateHeadingText } = require('../helpers');
const CONSTANTS = require('../../constants');

/**
 * Builds a query string from query parameter values
 * @param {string} search Value for the search query parameter
 * @param {string} sortfield Value for the sortfield query parameter
 * @param {string} sortorder Value for the sortorder query parameter
 * @returns {string} Query string
 */
const buildQueryStringFromQueryParameterValues = (search, sortfield, sortorder) => {
  const queryParameters = [];
  if (search) {
    queryParameters.push(`search=${search}`);
  }
  if (sortfield && sortorder) {
    queryParameters.push(`sortfield=${sortfield}&sortorder=${sortorder}`);
  }

  let queryString = '';
  if (queryParameters.length > 0) {
    queryString = `?${queryParameters.join('&')}`;
  }
  return queryString;
};

/**
 * Makes a request to TFM API to get the facilities and renders the facilities page with the facilities
 * @param {Object} req The request object
 * @param {Object} res The response object
 * @returns {Object} The result from rendering the page
 */
const getFacilities = async (req, res) => {
  const pageNumber = Number(req.params.pageNumber) || 0;
  if (pageNumber < 0) {
    return res.redirect('/not-found');
  }

  const { sortfield, sortorder, search } = req.query;
  const sortBy = {
    field: sortfield ?? CONSTANTS.FACILITY.TFM_SORT_BY_DEFAULT.field,
    order: sortorder ?? CONSTANTS.FACILITY.TFM_SORT_BY_DEFAULT.order,
  };
  const queryParams = {
    sortBy,
    pagesize: CONSTANTS.DEALS.PAGE_SIZE,
    page: pageNumber,
  };
  if (search) {
    queryParams.searchString = search;
  }

  const { userToken } = req.session;

  const { facilities, pagination } = await api.getFacilities(queryParams, userToken);
  if (!facilities || !pagination) {
    return res.redirect('/not-found');
  }
  if (pageNumber >= pagination.totalPages && !(pageNumber === 0 && pagination.totalPages === 0)) {
    return res.redirect('/not-found');
  }

  const { data: amendments } = await api.getAllAmendmentsInProgress(userToken);
  // set each facility's hasAmendmentInProgress to true if it has an amendment in progress
  if (Array.isArray(amendments) && amendments?.length > 0) {
    amendments.map((item) => {
      const amendmentInProgress = item.status === CONSTANTS.AMENDMENTS.AMENDMENT_STATUS.IN_PROGRESS;
      if (amendmentInProgress) {
        return facilities.map((facility) => {
          if (item.facilityId === facility.facilityId) {
            // eslint-disable-next-line no-param-reassign
            facility.hasAmendmentInProgress = true;
          }
          return facility;
        });
      }
      return item;
    });
  }

  const activeSortByField = sortBy.field;
  const activeSortByOrder = sortBy.order;
  const sortButtonWasClicked = sortfield ? true : false;

  return res.render('facilities/facilities.njk', {
    heading: generateHeadingText(pagination.totalItems, search, 'facilities'),
    facilities,
    activePrimaryNavigation: 'all facilities',
    activeSubNavigation: 'facility',
    user: req.session.user,
    sortButtonWasClicked,
    activeSortByField,
    activeSortByOrder,
    pages: {
      totalPages: parseInt(pagination.totalPages, 10),
      currentPage: parseInt(pagination.currentPage, 10),
      totalItems: parseInt(pagination.totalItems, 10),
    },
    queryString: buildQueryStringFromQueryParameterValues(search, sortfield, sortorder),
  });
};

/**
 * Redirects to GET /facilities with a query string constructed from the query
 * @param {Object} req The request object
 * @param {Object} res The response object
 * @returns {Object} The result from redirecting
 */
const queryFacilities = (req, res) => {
  const { search: newSearch, ascending, descending } = req.body;
  let newSortOrder;
  let newSortField;
  if (ascending || descending) {
    newSortOrder = ascending ? CONSTANTS.FACILITY.TFM_SORT_BY.ASCENDING : CONSTANTS.FACILITY.TFM_SORT_BY.DESCENDING;
    newSortField = req.body[newSortOrder];
  }

  const { search: oldSearch, sortfield: oldSortField, sortorder: oldSortOrder } = req.query;

  const search = newSearch ?? oldSearch;
  const sortfield = newSortField ?? oldSortField;
  const sortorder = newSortOrder ?? oldSortOrder;

  const redirectUrl = `/facilities/0${buildQueryStringFromQueryParameterValues(search, sortfield, sortorder)}`;
  return res.redirect(redirectUrl);
};

module.exports = {
  getFacilities,
  queryFacilities
};
