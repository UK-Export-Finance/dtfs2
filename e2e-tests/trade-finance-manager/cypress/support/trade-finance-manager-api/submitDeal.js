const { logIn } = require('../portal-api/api');
const { submitDeal } = require('./api');

module.exports = (dealId) => {
  submitDeal(dealId);
};
