const facilitiesPage = require('../../../e2e/pages/facilitiesPage');

module.exports = ({ firstFacilityId, increment, numberToCheck }) => {
  let expectedFacilityId = Number(firstFacilityId);

  for (let rowNumber = 0; rowNumber < numberToCheck; rowNumber += 1) {
    facilitiesPage.facilityIdCell(rowNumber).contains(expectedFacilityId.toString());

    expectedFacilityId += increment;
  }
};
