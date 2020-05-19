const supplierTypeIsRequired = require('./supplier-type-is-required');
const supplierNameIsRequired = require('./supplier-name-is-required');
const supplierAddressIsRequired = require('./supplier-address-is-required');
const supplierCorrespondenceAddressIsRequired = require('./supplier-correspondence-address-is-required-if-different');
const industrySectorIsRequired = require('./industry-sector-is-required');
const industryClassIsRequired = require('./industry-class-is-required');
const smeTypeIsRequired = require('./sme-type-is-required');
const supplyContractDescriptionIsRequired = require('./supply-contract-description-is-required');
const indemnifierDataIsRequired = require('./indemnifier-data-is-required-if-legally-distinct');
const indemnifierCorrespondenceAddressIsRequired = require('./indemnifier-correspondence-address-is-required-if-different');

const rules = [
  supplierTypeIsRequired,
  supplierNameIsRequired,
  supplierAddressIsRequired,
  supplierCorrespondenceAddressIsRequired,
  industrySectorIsRequired,
  industryClassIsRequired,
  smeTypeIsRequired,
  supplyContractDescriptionIsRequired,
  indemnifierDataIsRequired,
  indemnifierCorrespondenceAddressIsRequired,
];

module.exports = (submissionDetails) => {
  let errorList = {};

  for (let i = 0; i < rules.length; i += 1) {
    errorList = rules[i](submissionDetails, errorList);
  }

  return errorList;
};
