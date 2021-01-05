const bankSupplyContractID = require('./bank-supply-contract-id');
const bankSupplyContractName = require('./bank-supply-contract-name');
const makerObject = require('./maker-object');

const rules = [
  bankSupplyContractID,
  bankSupplyContractName,
  makerObject,
];

module.exports = (deal) => {
  let errorList = {};

  for (let i = 0; i < rules.length; i += 1) {
    errorList = rules[i](deal, errorList);
  }

  return errorList;
};
