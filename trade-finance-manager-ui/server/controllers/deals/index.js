const api = require('../../api');
const { generateHeadingText } = require('../helpers');
const CONSTANTS = require('../../constants');

const getDeals = async (req, res) => {
  // TODO: handle error for page Num too big
  // TODO: fetch number of items from db
  const NUMBER_OF_ITEMS = 2168;
  const queryParams = {
    sortBy: CONSTANTS.DEALS.TFM_SORT_BY_DEFAULT,
    pagesize: CONSTANTS.DEALS.PAGE_SIZE,
    start: req.params.pageNumber ? req.params.pageNumber * CONSTANTS.DEALS.PAGE_SIZE : 0,
  };

  const { userToken } = req.session;

  const apiResponse = await api.getDeals(queryParams, userToken);
  const { data: amendments } = await api.getAllAmendmentsInProgress(userToken);

  // override the deal stage if there is an amendment in progress
  if (Array.isArray(amendments) && amendments?.length > 0) {
    amendments.map((item) => {
      const amendmentInProgress = item.status === CONSTANTS.AMENDMENTS.AMENDMENT_STATUS.IN_PROGRESS;
      if (amendmentInProgress) {
        return apiResponse.deals.map((deal) => {
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

  if (apiResponse && apiResponse.deals) {
    return res.render('deals/deals.njk', {
      heading: 'All deals',
      deals: apiResponse.deals,
      activePrimaryNavigation: 'all deals',
      activeSubNavigation: 'deal',
      user: req.session.user,
      sortButtonWasClicked: false,
      activeSortByField: CONSTANTS.DEALS.TFM_SORT_BY_DEFAULT.field,
      activeSortByOrder: CONSTANTS.DEALS.TFM_SORT_BY_DEFAULT.order,
      pages: {
        totalPages: Math.ceil(NUMBER_OF_ITEMS / CONSTANTS.DEALS.PAGE_SIZE),
        currentPage: parseInt(req.params.pageNumber, 10),
        totalItems: parseInt(NUMBER_OF_ITEMS, 10),
      },
    });
  }

  return res.redirect('/not-found');
};

const queryDeals = async (req, res) => {
  let activeSortByOrder = CONSTANTS.DEALS.TFM_SORT_BY.ASCENDING;
  let activeSortByField = '';
  let searchString = '';
  const { userToken } = req.session;
  const sortButtonWasClicked = req.body?.formId === 'deals-table-sorting';

  if (req.body.search) {
    searchString = req.body.search;
  }

  // TODO: fetch number of items from db
  const NUMBER_OF_ITEMS = 2168;

  const queryParams = {
    searchString,
    pagesize: CONSTANTS.DEALS.PAGE_SIZE,
    start: req.body.pageNumber ? req.body.pageNumber * CONSTANTS.DEALS.PAGE_SIZE : 0,
  };

  if (req.body.descending || req.body.ascending) {
    const order = req.body?.ascending ? 'ascending' : 'descending';
    activeSortByField = req.body[order];

    queryParams.sortBy = {
      field: activeSortByField,
      order,
    };
  }

  const { deals, count } = await api.getDeals(queryParams, userToken);

  if (req.body.descending) {
    activeSortByOrder = CONSTANTS.DEALS.TFM_SORT_BY.DESCENDING;
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

  return res.render('deals/deals.njk', {
    heading: generateHeadingText(count, searchString),
    deals,
    activePrimaryNavigation: 'all deals',
    activeSubNavigation: 'deal',
    user: req.session.user,
    sortButtonWasClicked,
    activeSortByField,
    activeSortByOrder,
    pages: {
      totalPages: Math.ceil(NUMBER_OF_ITEMS / CONSTANTS.DEALS.PAGE_SIZE),
      currentPage: parseInt(req.params.pageNumber, 10),
      totalItems: parseInt(NUMBER_OF_ITEMS, 10),
    },
  });
};

module.exports = {
  getDeals,
  queryDeals,
};
