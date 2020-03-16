const builder = require('../builder');

module.exports = (overrides) => {

  const template = {
    bankFacilityId: "123456",
    ukefFacilityId: "20012345",
    type: "Bond",
    value: "USD 12,345,678.00",
    stage: "Unissued",
    issuedDate: "",
    maker: "MAKERDURGA",
    checker: "CHECKER DURGA"
  };

  return builder(template, overrides);
}
