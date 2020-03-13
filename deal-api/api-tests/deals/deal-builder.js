module.exports = (overrides) => {

  // some default json. Could be an actual deal; at time of writing we just need 'some json'..
  const deal = {
    "supplyContractName": "AAAA",
    "id": "1234",
    "details": {
      "bankSupplyContractID": "BBBB",
    }
  };

  // loop through the provided overrides and override the key/value pairs
  //TODO get clever and let us override 'details.bankSupplyContractID'
  for (key of Object.keys(overrides)) {
    deal[key]=overrides[key];
  };

  return deal;
}
