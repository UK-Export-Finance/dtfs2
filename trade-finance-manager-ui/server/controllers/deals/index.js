const api = require('../../api');
const { generateHeadingText } = require('../helpers');
const CONSTANTS = require('../../constants');
const PageOutOfBoundsError = require('../../errors/page-out-of-bounds.error');

/**
 * Builds a query parameters object for requests to the GET /deals TFM API endpoint
 * based on the values provided
 * @param {Object} sortBy Value for the sortBy query parameter
 * @param {string} page Value for the page query parameter
 * @param {string} searchString Value for the searchString query parameter
 * @returns {string} Query parameters object
 */
const buildQueryParametersObject = (sortBy, page, searchString) => {
  const queryParams = {
    sortBy,
    pagesize: CONSTANTS.DEALS.TFM_PAGE_SIZE,
    page: page,
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

/**
 * Makes a request to TFM API to get the deals and renders the deals page with the deals
 * @param {Object} req The request object
 * @param {Object} res The response object
 * @returns {Object} The result from rendering the page
 */
const getDeals = async (req, res) => {
  try {
    const pageNumber = Number(req.params.pageNumber) || 0;
    if (pageNumber < 0) {
      throw new PageOutOfBoundsError('Page number is less than the minimum page number');
    }

    const { sortfield, sortorder, search } = req.query;
    const sortBy = {
      field: sortfield ?? CONSTANTS.DEALS.TFM_SORT_BY_DEFAULT.field,
      order: sortorder ?? CONSTANTS.DEALS.TFM_SORT_BY_DEFAULT.order,
    };
    const queryParams = buildQueryParametersObject(sortBy, pageNumber, search);

    const { userToken } = req.session;

    const { deals, pagination } = await api.getDeals(queryParams, userToken);

    const { data: amendments } = await api.getAllAmendmentsInProgress(userToken);
    // override the deal stage if there is an amendment in progress
    if (Array.isArray(amendments) && amendments?.length > 0) {
      amendments.map((item) => {
        const amendmentInProgress = item.status === CONSTANTS.AMENDMENTS.AMENDMENT_STATUS.IN_PROGRESS;
        if (amendmentInProgress) {
          return deals.map((deal) => {
            if (item.dealId === deal._id) {
              // eslint-disable-next-line no-param-reassign
              deal.tfm.stage = CONSTANTS.DEAL.DEAL_STAGE.AMENDMENT_IN_PROGRESS;
            }
            return deal;
          });
        }
        return item;
      });
    }

    const activeSortByField = sortBy.field;
    const activeSortByOrder = sortBy.order;
    const sortButtonWasClicked = sortfield ? true : false;

    return res.render('deals/deals.njk', {
      heading: generateHeadingText(pagination?.totalItems, search),
      deals,
      activePrimaryNavigation: 'all deals',
      activeSubNavigation: 'deal',
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
 * Redirects to GET /deals with a query string constructed from the query
 * @param {Object} req The request object
 * @param {Object} res The response object
 * @returns {Object} The result from redirecting
 */
const queryDeals = (req, res) => {
  const pageNumber = Number(req.params.pageNumber) || 0;
  if (pageNumber < 0) {
    return res.redirect('/not-found');
  }

  const { search: newSearch, ascending, descending } = req.body;
  let newSortOrder;
  let newSortField;
  if (ascending || descending) {
    newSortOrder = ascending ? CONSTANTS.DEALS.TFM_SORT_BY.ASCENDING : CONSTANTS.DEALS.TFM_SORT_BY.DESCENDING;
    newSortField = req.body[newSortOrder];
  }

  const { search: oldSearch, sortfield: oldSortField, sortorder: oldSortOrder } = req.query;

  const search = newSearch ?? oldSearch;
  const sortfield = newSortField ?? oldSortField;
  const sortorder = newSortOrder ?? oldSortOrder;

  const redirectUrl = `/deals/${pageNumber}${buildQueryStringFromQueryParameterValues(search, sortfield, sortorder)}`;
  return res.redirect(redirectUrl);
};

module.exports = {
  getDeals,
  queryDeals,
};
