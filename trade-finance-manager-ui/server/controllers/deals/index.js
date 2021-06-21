import api from '../../api';
import generateHeadingText from './helpers';

const defaultSortBy = {
  field: 'dealSnapshot.details.submissionDate',
  order: 'ascending',
};

const getDeals = async (req, res) => {
  const queryParams = {
    sortBy: defaultSortBy,
  };

  const apiResponse = await api.getDeals(queryParams);

  if (apiResponse && apiResponse.deals) {
    return res.render('deals/deals.njk', {
      heading: 'All deals',
      deals: apiResponse.deals,
      activePrimaryNavigation: 'all deals',
      activeSubNavigation: 'deal',
      user: req.session.user,
      activeSortByField: defaultSortBy.field,
      activeSortByOrder: defaultSortBy.order,
    });
  }

  return res.redirect('/not-found');
};


const queryDeals = async (req, res) => {
  let activeSortByOrder = 'ascending';
  let activeSortByField = '';
  let searchString = '';

  if (req.body.search) {
    searchString = req.body.search;
  }

  const queryParams = { searchString };

  if (req.body.descending || req.body.ascending) {
    const sortBy = Object.getOwnPropertyNames(req.body)[0];
    const sortByField = req.body[sortBy];
    activeSortByField = sortByField;

    queryParams.sortBy = {
      field: sortByField,
      order: sortBy,
    };
  }

  const { deals, count } = await api.getDeals(queryParams);

  if (req.body.descending) {
    activeSortByOrder = 'descending';
  }

  return res.render('deals/deals.njk', {
    heading: generateHeadingText(count, searchString),
    deals,
    activePrimaryNavigation: 'all deals',
    activeSubNavigation: 'deal',
    user: req.session.user,
    activeSortByField,
    activeSortByOrder,
  });
};

export default {
  getDeals,
  queryDeals,
};
