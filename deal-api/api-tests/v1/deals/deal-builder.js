module.exports = overrides => {
  // some default json. Could be an actual deal; at time of writing we just need 'some json'..
  return {
    "supplyContractName": "AAAA",
    "id": "1234",
    "details": {
      "bankSupplyContractID": "BBBB"
    },
    ...overrides
  };
};
