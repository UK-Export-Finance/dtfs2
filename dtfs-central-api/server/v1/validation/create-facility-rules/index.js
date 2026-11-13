const type = require('./type');
const dealId = require('./associated-deal-id');

const rules = [type, dealId];

module.exports = (facility) => {
  let errorList = {};

  for (let index = 0; index < rules.length; index += 1) {
    errorList = rules[index](facility, errorList);
  }

  return errorList;
};
