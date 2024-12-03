const { ObjectId } = require('bson');
const template = require('./template.json');

module.exports = () => {
  const deal = { ...template };

  deal.loanTransactions.items[0]._id = new ObjectId();
  deal.bondTransactions.items[0]._id = new ObjectId();

  return deal;
};
