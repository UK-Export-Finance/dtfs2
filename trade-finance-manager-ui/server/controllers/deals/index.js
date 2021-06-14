import api from '../../api';
import generateHeadingText from './helpers';

const getDeals = async (req, res) => {
  const apiResponse = await api.getDeals();

  if (apiResponse && apiResponse.deals) {
    return res.render('deals/deals.njk', {
      heading: 'All deals',
      deals: apiResponse.deals,
      activePrimaryNavigation: 'all deals',
      activeSubNavigation: 'deal',
      user: req.session.user,
    });
  }

  return res.redirect('/not-found');
};


const searchDeals = async (req, res) => {
  let searchString = '';

  if (req.body.search) {
    searchString = req.body.search;
  }

  const { deals, count } = await api.getDeals(searchString);

  return res.render('deals/deals.njk', {
    heading: generateHeadingText(count, searchString),
    deals,
    activePrimaryNavigation: 'all deals',
    activeSubNavigation: 'deal',
    user: req.session.user,
  });
};

export default {
  generateHeadingText,
  getDeals,
  searchDeals,
};
