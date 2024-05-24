const { deleteTfmDeal } = require('./api');

module.exports = (dealId) => {
  console.info('deleteTfmDeal::');
  deleteTfmDeal(dealId, {
    userType: 'tfm',
    id: 'bad123456789bad123456789',
  });
};
