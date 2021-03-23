import api from '../../api';

const getDeals = async (req, res) => {
  const deals = await api.getDeals();
  if (!deals) {
    return res.redirect('/not-found');
  }

  const compare = (a, b) => {
    if (b.dealSnapshot.details.submissionDate < a.dealSnapshot.details.submissionDate) {
      return -1;
    }
    if (b.dealSnapshot.details.submissionDate > a.dealSnapshot.details.submissionDate) {
      return 1;
    }
    return 0;
  };

  deals.deals.sort((a, b) =>
    compare(a, b));

  return res.render('deals/deals.njk', {
    deals,
    activePrimaryNavigation: 'all deals',
    activeSubNavigation: 'deal',
    user: req.session.user,
  });
};

export default {
  getDeals,
};
