const { deleteTfmDeal } = require('./api');

module.exports = (dealId) => {
  console.log('deleteTfmDeal::');
  deleteTfmDeal(dealId);
};
