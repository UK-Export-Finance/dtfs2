const { logIn } = require('../portal-api/api');
const { submitDeal } = require('./api');

module.exports = (dealId, opts) => {
  logIn(opts).then((token) => {
    submitDeal(dealId, token);
  });
};
