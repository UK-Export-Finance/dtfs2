const builder = require('../builder');

module.exports = (overrides) => {

  const template = {
    "supplyContractName": "AAAA",
    "id": "1234",
    "details": {
      "bankSupplyContractID": "BBBB",
    }
  };

  return builder(template, overrides);
}
