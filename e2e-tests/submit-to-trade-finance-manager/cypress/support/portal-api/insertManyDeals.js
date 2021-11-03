const {
  insertDeal, getDeal, logIn, listAllDeals, deleteDeal,
} = require('./api');

module.exports = (deals, opts) => {
  console.log('createManyDeals::');

  logIn(opts).then((token) => {
    const persisted = [];
    // delete existing deals
    listAllDeals(token).then(async (deal) => {
      await deal.forEach((val) => deleteDeal(token, val));
    });

    Object.values(deals).forEach((val) => {
      insertDeal(val, token).then((insertedDeal) => {
        getDeal(insertedDeal._id, token).then(({ deal }) => {
          persisted.push(deal);
          if (persisted.length === deals.length) {
            return persisted;
          }
        });
      });
    });
  });
};
