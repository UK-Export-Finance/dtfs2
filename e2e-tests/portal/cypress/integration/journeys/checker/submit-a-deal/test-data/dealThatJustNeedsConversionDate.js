const { ObjectID } = require('bson');
const template = require('./template.json');

module.exports = () => {
  const deal = { ...template };

  deal.loanTransactions.items[0]._id = ObjectID();
  deal.bondTransactions.items[0]._id = ObjectID();

  return deal;
};
