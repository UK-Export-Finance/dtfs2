const template = require('./template.json');

let counter = 0;
const id = () => {
  counter = counter + 1;
  return counter;
}

module.exports = () => {
  const deal = JSON.parse(JSON.stringify(template));

  deal.loanTransactions.items[0]._id = id();
  deal.bondTransactions.items[0]._id = id();

  return deal;
}
