import api from '../../api';

const getDeals = async (req, res) => {
  const deals = await api.getDeals();

  if (!deals) {
    return res.redirect('/not-found');
  }

  return res.render('deals/deals.njk', {
    deals,
    activePrimaryNavigation: 'all deals',
    activeSubNavigation: 'deal',
    user: req.session.user,
  });
};

const searchDeals = async (req, res) => {
  let searchString;

  if (req.body.search) {
    searchString = req.body.search;
  }

  const deals = await api.getDeals(searchString);

  return res.render('deals/deals.njk', {
    deals,
    activePrimaryNavigation: 'all deals',
    activeSubNavigation: 'deal',
    user: req.session.user,
  });
};

export default {
  getDeals,
  searchDeals,
};
