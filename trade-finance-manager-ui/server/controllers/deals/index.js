const api = require('../../api');
const { generateHeadingText } = require('../helpers');
const CONSTANTS = require('../../constants');

const buildQueryStringFromQueryParameters = (search, sortfield, sortorder) => {
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

const getDeals = async (req, res) => {
  const pageNumber = Number(req.params.pageNumber) || 0;
  if (pageNumber < 0) {
    return res.redirect('/not-found');
  }

  const { sortfield, sortorder, search } = req.query;
  const sortBy = {
    field: sortfield ?? CONSTANTS.DEALS.TFM_SORT_BY_DEFAULT.field,
    order: sortorder ?? CONSTANTS.DEALS.TFM_SORT_BY_DEFAULT.order,
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

  const { deals, pagination } = await api.getDeals(queryParams, userToken);
  if (!deals || !pagination) {
    return res.redirect('/not-found');
  }
  if (pageNumber >= pagination.totalPages && !(pageNumber === 0 && pagination.totalPages === 0)) {
    return res.redirect('/not-found');
  }

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
    heading: generateHeadingText(pagination.totalItems, search),
    deals,
    activePrimaryNavigation: 'all deals',
    activeSubNavigation: 'deal',
    user: req.session.user,
    sortButtonWasClicked,
    activeSortByField,
    activeSortByOrder,
    pages: {
      totalPages: parseInt(pagination.totalPages, 10),
      currentPage: parseInt(pagination.currentPage, 10),
      totalItems: parseInt(pagination.totalItems, 10),
    },
    queryString: buildQueryStringFromQueryParameters(search, sortfield, sortorder),
  });
};

const queryDeals = (req, res) => {
  const pageNumber = Number(req.params.pageNumber) || 0;
  if (pageNumber < 0) {
    return res.redirect('/not-found');
  }

  const { search: newSearch, ascending, descending } = req.body;
  let newSortOrder; let
    newSortField;
  if (ascending || descending) {
    newSortOrder = ascending ? CONSTANTS.DEALS.TFM_SORT_BY.ASCENDING : CONSTANTS.DEALS.TFM_SORT_BY.DESCENDING;
    newSortField = req.body[newSortOrder];
  }

  const { search: oldSearch, sortfield: oldSortField, sortorder: oldSortOrder } = req.query;

  const search = newSearch ?? oldSearch;
  const sortfield = newSortField ?? oldSortField;
  const sortorder = newSortOrder ?? oldSortOrder;

  const redirectUrl = `/deals/${pageNumber}${buildQueryStringFromQueryParameters(search, sortfield, sortorder)}`;
  return res.redirect(redirectUrl);
};

module.exports = {
  getDeals,
  queryDeals,
};
