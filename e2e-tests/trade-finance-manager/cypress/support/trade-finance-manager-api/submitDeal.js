const { submitDealAfterUkefIds } = require('./api');

module.exports = (dealId, dealType) => {
  console.info('submitDeal::');
  return submitDealAfterUkefIds(dealId, dealType);
};
