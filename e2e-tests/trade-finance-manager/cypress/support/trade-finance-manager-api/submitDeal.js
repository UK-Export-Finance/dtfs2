const { submitDeal } = require('./api');

module.exports = (dealId, dealType) => {
  console.log('submitDeal::');
  submitDeal(dealId, dealType);
};
