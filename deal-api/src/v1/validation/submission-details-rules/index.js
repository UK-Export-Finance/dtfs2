const supplierTypeIsRequired = require('./supplier-type-is-required');
const supplierNameIsRequired = require('./supplier-name-is-required');

const rules = [
  supplierTypeIsRequired,
  supplierNameIsRequired,
];

module.exports = (submissionDetails) => {
  let errorList = {};

  for (let i = 0; i < rules.length; i += 1) {
    errorList = rules[i](submissionDetails, errorList);
  }

  return errorList;
};
