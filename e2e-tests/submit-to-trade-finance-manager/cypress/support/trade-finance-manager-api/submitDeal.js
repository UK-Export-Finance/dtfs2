const { submitDeal, submitDealAfterUkefIds } = require('./api');

module.exports = (dealId, dealType) => {
  console.log('submitDeal::');
  submitDeal(dealId, dealType).then(() => {
    submitDealAfterUkefIds(dealId, dealType);
  });
};
