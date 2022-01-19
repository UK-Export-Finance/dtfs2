const { listAllDeals, logIn, deleteDeal, deleteGefApplication } = require('./api');

const deleteAllDeals = (token, deals) => {
  if (!deals || !deals.length) return;

  deals.forEach(async (deal) => {
    if (deal.product === 'BSS/EWCS') {
      return deleteDeal(token, deal)
    }

    if (deal.product === 'GEF') {
      return deleteGefApplication(token, deal._id);
    }
  });
};

module.exports = (opts) => logIn(opts).then((token) => {
  listAllDeals(token).then(async (deals) => {
    await deleteAllDeals(token, deals);
  });
});
