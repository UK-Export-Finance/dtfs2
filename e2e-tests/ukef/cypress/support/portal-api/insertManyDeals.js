const { insertDeal, getDeal, logIn } = require('./api');

module.exports = (deals, opts) => {
  console.info('createManyDeals::');

  logIn(opts).then((token) => {
    const persisted = [];

    // eslint-disable-next-line no-restricted-syntax
    for (const dealToInsert of deals) {
      insertDeal(dealToInsert, token).then((insertedDeal) => {
        // eslint-disable-next-line consistent-return
        getDeal(insertedDeal._id, token).then(({ deal }) => {
          persisted.push(deal);
          if (persisted.length === deals.length) {
            return persisted;
          }
        });
      });
    }
  });
};
