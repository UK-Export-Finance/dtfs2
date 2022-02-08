const { insertDeal, getDeal, logIn } = require('./api');

module.exports = (deals, opts) => {
  console.info('createManyDeals::');

  logIn(opts).then((token) => {
    const persisted = [];

    deals.forEach((dealToInsert) => {
      insertDeal(dealToInsert, token).then((insertedDeal) => {
        getDeal(insertedDeal._id, token).then(({ deal }) => {
          persisted.push(deal);
          return persisted;
        });
      });
    });
  });
};
