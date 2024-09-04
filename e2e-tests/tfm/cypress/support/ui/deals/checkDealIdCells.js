const dealsPage = require('../../../e2e/pages/dealsPage');

module.exports = ({ firstDealId, increment, numberToCheck }) => {
  let expectedDealId = Number(firstDealId);

  for (let rowNumber = 0; rowNumber < numberToCheck; rowNumber += 1) {
    dealsPage.dealIdCell(rowNumber).contains(expectedDealId.toString());

    expectedDealId += increment;
  }
};
