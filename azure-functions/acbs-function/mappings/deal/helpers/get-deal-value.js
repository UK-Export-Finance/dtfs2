const { getFacilityValue } = require('../../facility/helpers');

const getDealValue = (deal) => deal.dealSnapshot.facilities.reduce(
  (total, facility) => total + getFacilityValue(facility),
  0,
);

module.exports = getDealValue;
