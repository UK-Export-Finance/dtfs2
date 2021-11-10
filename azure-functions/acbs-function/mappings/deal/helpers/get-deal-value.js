const { getFacilityValue, getBaseCurrency } = require('../../facility/helpers');

const getDealValue = (deal) => {
  let total = 0;
  const currency = getBaseCurrency(deal.dealSnapshot.facilities);
  // eslint-disable-next-line no-plusplus
  for (let i = 0; i < deal.dealSnapshot.facilities.length; i++) {
    total += getFacilityValue(deal.dealSnapshot.facilities[i], currency);
  }
  return total;
};

module.exports = getDealValue;
