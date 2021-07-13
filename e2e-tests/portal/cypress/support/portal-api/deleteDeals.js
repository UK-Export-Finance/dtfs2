const { listAllDeals, logIn, deleteDeal } = require('./api');

const deleteAllDeals = (token, deals) => {
  if (!deals || !deals.length) return;
  deals.forEach(async (deal) => deleteDeal(token, deal));
};

module.exports = (opts) => logIn(opts).then((token) => {
  listAllDeals(token).then(async (deals) => {
    await deleteAllDeals(token, deals);
  });
});
