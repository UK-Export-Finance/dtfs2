const api = require('../../api');
const CONSTANTS = require('../../constants');
const PageOutOfBoundsError = require('../../errors/page-out-of-bounds.error');
const InvalidCollectionNameError = require('../../errors/invalid-collection-name.error');
const { generateHeadingText } = require('./generateHeadingText.helper');
const { overrideDealsIfAmendmentsInProgress } = require('./overrideDealsIfAmendmentsInProgress.helper');
const { overrideFacilitiesIfAmendmentsInProgress } = require('./overrideFacilitiesIfAmendmentsInProgress.helper');

/**
 * Builds a query parameters object for requests to the GET /deals or GET /facilities TFM API endpoints
 * based on the values provided
 * @param {object} sortBy Value for the sortBy query parameter
 * @param {string} page Value for the page query parameter
 * @param {string} searchString Value for the searchString query parameter
 * @returns {string} Query parameters object
 */
const buildQueryParametersObject = (sortBy, page, searchString) => {
  const queryParams = {
    sortBy,
    pagesize: CONSTANTS.TABLE.PAGE_SIZE,
    page,
  };
  if (searchString) {
    queryParams.searchString = searchString;
  }

  return queryParams;
};

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

const getPageNumber = (page) => {
  const pageNumber = Number(page) || 0;

  if (pageNumber < 0) {
    throw new PageOutOfBoundsError('Page number is less than the minimum page number');
  }

  return pageNumber;
};

const getSortByDefault = (collectionName) => {
  if (collectionName === 'deals') {
    return CONSTANTS.TABLE.SORT_BY.DEFAULT.DEALS;
  }
  if (collectionName === 'facilities') {
    return CONSTANTS.TABLE.SORT_BY.DEFAULT.FACILITIES;
  }

  throw new InvalidCollectionNameError(collectionName);
};

const generateSortByQuery = ({ collectionName, reqQuery }) => {
  const sortByDefault = getSortByDefault(collectionName);

  const { sortfield, sortorder } = reqQuery;

  return {
    field: sortfield ?? sortByDefault.field,
    order: sortorder ?? sortByDefault.order,
  };
};

const getDealsOrFacilitiesItems = async (collectionName, queryParams, userToken, amendments) => {
  let items;
  let pagination;
  if (collectionName === 'deals') {
    ({ deals: items, pagination } = await api.getDeals(queryParams, userToken));
    items = overrideDealsIfAmendmentsInProgress(items, amendments);
  }
  if (collectionName === 'facilities') {
    ({ facilities: items, pagination } = await api.getFacilities(queryParams, userToken));
    items = overrideFacilitiesIfAmendmentsInProgress(items, amendments);
  }
  return { items, pagination };
};

const getSingularCollectionName = (collectionName) => {
  if (collectionName === 'deals') {
    return 'deal';
  }

  if (collectionName === 'facilities') {
    return 'facility';
  }

  throw new InvalidCollectionNameError(collectionName);
};

/**
 * Makes a request to TFM API to get either the deals or facilities and renders the relevant page with the returned data
 * @param {string} collectionName The name of the collection, either 'deals' or 'facilities'
 * @param {object} req The request object
 * @param {object} res The response object
 * @returns {Promise<object>} The result from rendering the page
 */
const renderDealsOrFacilitiesPage = async (collectionName, req, res) => {
  try {
    const pageNumber = getPageNumber(req.params.pageNumber);
    const sortByQuery = generateSortByQuery({ collectionName, reqQuery: req.query });

    const { search, sortfield, sortorder } = req.query;
    const queryParams = buildQueryParametersObject(sortByQuery, pageNumber, search);

    const { userToken } = req.session;

    const { data: amendments } = await api.getAllAmendmentsInProgress(userToken);
    const { items, pagination } = await getDealsOrFacilitiesItems(collectionName, queryParams, userToken, amendments);

    const activeSortByField = sortByQuery.field;
    const activeSortByOrder = sortByQuery.order;
    const sortButtonWasClicked = !!sortfield;

    return res.render(`${collectionName}/${collectionName}.njk`, {
      heading: generateHeadingText(pagination?.totalItems, search, collectionName),
      [collectionName]: items,
      activePrimaryNavigation: `all ${collectionName}`,
      activeSubNavigation: getSingularCollectionName(collectionName),
      user: req.session.user,
      sortButtonWasClicked,
      activeSortByField,
      activeSortByOrder,
      pages: {
        totalPages: parseInt(pagination?.totalPages, 10),
        currentPage: parseInt(pagination?.currentPage, 10),
        totalItems: parseInt(pagination?.totalItems, 10),
      },
      queryString: buildQueryStringFromQueryParameterValues(search, sortfield, sortorder),
    });
  } catch (error) {
    console.error(error);
    if (error instanceof PageOutOfBoundsError) {
      return res.redirect('/not-found');
    }
    return res.render('_partials/problem-with-service.njk');
  }
};

/**
 * Redirects to either GET /deals or GET /facilities with a query string constructed from the query
 * @param {string} collectionName The name of the collection, either 'deals' or 'facilities'
 * @param {object} req The request object
 * @param {object} res The response object
 * @returns {object} The result from redirecting
 */
const queryDealsOrFacilities = (collectionName, req, res) => {
  const { search: newSearch, ascending, descending } = req.body;
  let newSortOrder;
  let newSortField;
  if (ascending || descending) {
    newSortOrder = ascending ? CONSTANTS.TABLE.SORT_BY.ASCENDING : CONSTANTS.TABLE.SORT_BY.DESCENDING;
    newSortField = req.body[newSortOrder];
  }

  const { search: oldSearch, sortfield: oldSortField, sortorder: oldSortOrder } = req.query;

  const search = newSearch ?? oldSearch;
  const sortfield = newSortField ?? oldSortField;
  const sortorder = newSortOrder ?? oldSortOrder;

  const redirectUrl = `/${collectionName}/0${buildQueryStringFromQueryParameterValues(search, sortfield, sortorder)}`;
  return res.redirect(redirectUrl);
};

module.exports = {
  renderDealsOrFacilitiesPage,
  queryDealsOrFacilities,
};
