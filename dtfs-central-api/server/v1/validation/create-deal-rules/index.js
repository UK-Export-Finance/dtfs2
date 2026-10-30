const bankInternalRefName = require('./bank-supply-contract-id');
const additionalRefName = require('./bank-supply-contract-name');
const makerObject = require('./maker-object');

const rules = [bankInternalRefName, additionalRefName, makerObject];

module.exports = (deal) => {
  let errorList = {};

  for (let index = 0; index < rules.length; index += 1) {
    errorList = rules[index](deal, errorList);
  }

  return errorList;
};
