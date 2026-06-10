/* eslint-disable no-new */
/* eslint-disable no-restricted-syntax */
const getAllTfmDeals = require('./getAllTfmDeals');
const deleteTfmDeal = require('./deleteTfmDeal');

module.exports = () => {
  console.info('deleteTfmDeals::');

  return getAllTfmDeals().then((deals) => {
    return cy.wrap(deals).each((dealToDelete) => {
      const { _id } = dealToDelete;
      return deleteTfmDeal(_id);
    });
  });
};
