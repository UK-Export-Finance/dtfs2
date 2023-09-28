const { deleteTfmDeal } = require('./api');

module.exports = (dealId) => {
  console.info('deleteTfmDeal::');
  deleteTfmDeal(dealId);
};
