const { submitDealAfterUkefIds } = require('./api');

module.exports = (dealId, dealType) => {
  console.log('submitDeal::');
  return submitDealAfterUkefIds(dealId, dealType);
};
