const getAllTfmDeals = require('./getAllTfmDeals');
const deleteTfmDeal = require('./deleteTfmDeal');

const deleteAllDeals = (deals) => {
  for (const dealToDelete of deals) {
    const { _id } = dealToDelete;
    deleteTfmDeal(_id);
  };
}


module.exports = () => {
  console.info('deleteTfmDeals::');

  new Cypress.Promise(() => {
    getAllTfmDeals().then((deals) => {
      deleteAllDeals(deals);
    });
  });
};
