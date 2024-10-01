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
const buyerNameIsRequired = require('./buyer-name-is-required');
const buyerAddressIsRequired = require('./buyer-address-is-required');
const buyerDestinationOfGoodsAndServicesIsRequired = require('./buyer-destination-of-goods-and-services-is-required');
const supplyContractValueIsRequired = require('./supply-contract-value-is-required');
const supplyContractCurrencyIsRequired = require('./supply-contract-currency-is-required');
const supplyContractConversionRateIsRequired = require('./supply-contract-conversion-rate-is-required-for-non-GBP');
const supplyContractConversionRateDateIsRequired = require('./supply-contract-conversion-rate-date-is-required-for-non-GBP');

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
  buyerNameIsRequired,
  buyerAddressIsRequired,
  buyerDestinationOfGoodsAndServicesIsRequired,
  supplyContractValueIsRequired,
  supplyContractCurrencyIsRequired,
  supplyContractConversionRateIsRequired,
  supplyContractConversionRateDateIsRequired,
];

/**
 * Applies a set of rules to the submission details and returns any errors found.
 * @param {Object} submissionDetails - An object containing details of the submission.
 * @param {Object} deal - An object containing details of the deal.
 * @returns {Promise<object>} - An object containing any errors found during the rule checks.
 */
module.exports = async (submissionDetails, deal) => {
  let errors = {};

  if (submissionDetails?.v1Status) {
    return errors;
  }

  for (const rule of rules) {
    errors = await rule(submissionDetails, errors, deal);
  }

  return errors;
};
