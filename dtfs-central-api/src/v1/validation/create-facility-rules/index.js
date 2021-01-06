const facilityType = require('./facility-type');
const associatedDealId = require('./associated-deal-id');

const rules = [
  facilityType,
  associatedDealId,
];

module.exports = (facility) => {
  let errorList = {};

  for (let i = 0; i < rules.length; i += 1) {
    errorList = rules[i](facility, errorList);
  }

  return errorList;
};
