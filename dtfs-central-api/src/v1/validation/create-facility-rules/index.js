const facilityType = require('./facility-type');
const dealId = require('./associated-deal-id');

const rules = [
  facilityType,
  dealId,
];

module.exports = (facility) => {
  let errorList = {};

  for (let i = 0; i < rules.length; i += 1) {
    errorList = rules[i](facility, errorList);
  }

  return errorList;
};
