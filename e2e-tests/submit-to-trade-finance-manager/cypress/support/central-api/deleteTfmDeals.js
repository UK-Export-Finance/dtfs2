const getAllTfmDeals = require('./getAllTfmDeals');
const deleteTfmDeal = require('./deleteTfmDeal');

const deleteAllDeals = (deals) => {
  Object.values(deals).forEach((val) => {
    const { _id } = val;
    deleteTfmDeal(_id);
  });
};

module.exports = () => {
  console.log('deleteTfmDeals::');
  getAllTfmDeals().then((deals) => {
    deleteAllDeals(deals);
  });
};
