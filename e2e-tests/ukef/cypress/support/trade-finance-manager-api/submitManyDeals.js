const { submitDeal, login } = require('./api');
const { T1_USER_1 } = require('../../../../e2e-fixtures/tfm-users.fixture');

module.exports = (deals) => {
  console.info('submitManyDeals::');
  const persistedDeals = [];
  const { username, password } = T1_USER_1;

  deals.forEach((dealToInsert) => {
    login(username, password).then((token) =>
      submitDeal(dealToInsert._id, dealToInsert.dealType, token).then(() => {
        persistedDeals.push(dealToInsert);
        if (persistedDeals.length === deals.length) {
          return persistedDeals;
        }
        return null;
        // });
      }),
    );
  });
};
