const dealsPage = require('../../e2e/pages/dealsPage');

module.exports = ({ rowNumber, expectedDealId }) => {
  dealsPage.dealIdCell(rowNumber).contains(expectedDealId);
};