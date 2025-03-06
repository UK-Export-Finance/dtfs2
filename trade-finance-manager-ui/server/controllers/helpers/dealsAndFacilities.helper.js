const { MONGO_DB_COLLECTIONS } = require('@ukef/dtfs2-common');
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
 * @param {Object} sortBy Value for the sortBy query parameter
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

/**
 * Returns the default sort configuration for a given collection.
 *
 * @param {string} collectionName - The name of the MongoDB collection.
 * @returns {Object} The default sort configuration for the specified collection.
 * @throws {InvalidCollectionNameError} If the collection name is not recognized.
 */
const getSortByDefault = (collectionName) => {
  if (collectionName === MONGO_DB_COLLECTIONS.DEALS) {
    return CONSTANTS.TABLE.SORT_BY.DEFAULT.DEALS;
  }
  if (collectionName === MONGO_DB_COLLECTIONS.FACILITIES) {
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

/**
 * Retrieves deals or facilities items based on the specified collection name and query parameters.
 *
 * @param {string} collectionName - The name of the collection to retrieve items from ('deals' or 'facilities').
 * @param {Object} queryParams - The query parameters to filter the items.
 * @param {string} userToken - The user authentication token.
 * @param {Object} amendments - Amendments to be considered when overriding deals or facilities.
 * @returns {Promise<{items: Array, pagination: Object}>} A promise that resolves to an object containing the items and pagination information.
 * @throws Will log an error message if unable to retrieve the items.
 */
const getDealsOrFacilitiesItems = async (collectionName, queryParams, userToken, amendments) => {
  let items = [];
  let pagination = {
    totalPages: 0,
    currentPage: 0,
    totalItems: 0,
  };

  try {
    if (collectionName === MONGO_DB_COLLECTIONS.DEALS) {
      const response = await api.getDeals(queryParams, userToken);

      if (response.deals) {
        ({ deals: items, pagination } = response);
        items = overrideDealsIfAmendmentsInProgress(items, amendments);
      }
    }

    if (collectionName === MONGO_DB_COLLECTIONS.FACILITIES) {
      const response = await api.getFacilities(queryParams, userToken);

      if (response.facilities) {
        ({ facilities: items, pagination } = response);
        items = overrideFacilitiesIfAmendmentsInProgress(items, amendments);
      }
    }
  } catch (error) {
    console.error('Unable to get deals or facilities search items %o', error);
  }

  return { items, pagination };
};

/**
 * Returns the singular collection name for the given collection name.
 *
 * @param {string} collectionName - The name of the collection.
 * @returns {string} The singular collection name.
 * @throws {InvalidCollectionNameError} If the collection name is not recognized.
 */
const getSingularCollectionName = (collectionName) => {
  if (collectionName === MONGO_DB_COLLECTIONS.DEALS) {
    return MONGO_DB_COLLECTIONS.DEALS;
  }

  if (collectionName === MONGO_DB_COLLECTIONS.FACILITIES) {
    return MONGO_DB_COLLECTIONS.FACILITIES;
  }

  throw new InvalidCollectionNameError(collectionName);
};

/**
 * Makes a request to TFM API to get either the deals or facilities and renders the relevant page with the returned data
 * @param {string} collectionName The name of the collection, either 'deals' or 'facilities'
 * @param {Object} req The request object
 * @param {Object} res The response object
 * @returns {Promise<Object>} The result from rendering the page
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
    console.error('Error rendering deals or facilities page %o', error);

    if (error instanceof PageOutOfBoundsError) {
      return res.redirect('/not-found');
    }

    return res.render('_partials/problem-with-service.njk');
  }
};

/**
 * Redirects to either GET /deals or GET /facilities with a query string constructed from the query
 * @param {string} collectionName The name of the collection, either 'deals' or 'facilities'
 * @param {Object} req The request object
 * @param {Object} res The response object
 * @returns {Object} The result from redirecting
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
