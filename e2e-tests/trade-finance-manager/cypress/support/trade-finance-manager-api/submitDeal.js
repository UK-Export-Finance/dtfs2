const { submitDeal } = require('./api');

module.exports = (dealId) => {
  console.log('submitDeal::');
  submitDeal(dealId);
};
