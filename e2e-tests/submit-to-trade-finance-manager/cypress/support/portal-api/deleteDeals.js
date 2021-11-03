const { listAllDeals, logIn, deleteDeal } = require('./api');

const deleteAllDeals = async (token, deals) => {
  if (!deals || !deals.length) return;
  await deals.forEach((deal) => deleteDeal(token, deal));
};

module.exports = (opts) => logIn(opts).then((token) => {
  listAllDeals(token).then(async (deals) => {
    await deleteAllDeals(token, deals);
  });
});
