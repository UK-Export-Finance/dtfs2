const { getFacilityValue } = require('../../facility/helpers');

const getDealValue = (deal) => {
  let total = 0;
  // eslint-disable-next-line no-plusplus
  for (let i = 0; i < deal.dealSnapshot.facilities.length; i++) {
    total += getFacilityValue(deal.dealSnapshot.facilities[i]);
  }
  return total;
};

module.exports = getDealValue;
