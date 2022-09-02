const getAllTfmDeals = require('./getAllTfmDeals');
const deleteTfmDeal = require('./deleteTfmDeal');

const deleteAllDeals = (deals) => {
  deals.map(({ _id }) => deleteTfmDeal(_id));
};

module.exports = () => {
  console.info('deleteTfmDeals::');

  new Cypress.Promise(() => {
    getAllTfmDeals().then((deals) => {
      deleteAllDeals(deals);
    });
  });
};
