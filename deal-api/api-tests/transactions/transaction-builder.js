module.exports = (overrides) => {

  // some default json. Could be an actual deal; at time of writing we just need 'some json'..
  const transaction = {
    bankFacilityId: "123456",
    ukefFacilityId: "20012345",
    type: "Bond",
    value: "USD 12,345,678.00",
    stage: "Unissued",
    issuedDate: "",
    maker: "MAKERDURGA",
    checker: "CHECKER DURGA"
  };

  // loop through the provided overrides and override the key/value pairs
  //TODO get clever and let us override 'details.bankSupplyContractID'
  for (key of Object.keys(overrides)) {
    transaction[key]=overrides[key];
  };

  return transaction;
}
