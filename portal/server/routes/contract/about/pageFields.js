const FIELDS = {
  SUPPLIER: {
    REQUIRED_FIELDS: [
      'supplier-type',
      'supplier-name',
      'supplier-address-line-1',
      'supplier-address-town',
      'supplier-address-country',
      'supplier-correspondence-address-is-different',
      'industry-sector',
      'industry-class',
      'legallyDistinct',
      'sme-type',
      'supply-contract-description',
    ],
    CONDITIONALLY_REQUIRED_FIELDS: [
      'supplier-address-postcode',
      'supplier-correspondence-address-country',
      'supplier-correspondence-address-line-1',
      'supplier-correspondence-address-postcode',
      'supplier-correspondence-address-town',
      'indemnifier-name',
      'indemnifier-address-country',
      'indemnifier-address-line-1',
      'indemnifier-address-postcode',
      'indemnifier-address-town',
      'indemnifier-correspondence-address-country',
      'indemnifier-correspondence-address-line-1',
      'indemnifier-correspondence-address-postcode',
      'indemnifier-correspondence-address-town',
    ],
    OPTIONAL_FIELDS: [],
    ALWAYS_SHOW_ERROR_FIELDS: ['supplier-companies-house-registration-number', 'indemnifier-companies-house-registration-number'],
  },
  BUYER: {
    REQUIRED_FIELDS: ['buyer-name', 'buyer-address-country', 'buyer-address-line-1', 'destinationOfGoodsAndServices'],
    CONDITIONALLY_REQUIRED_FIELDS: ['buyer-address-town', 'buyer-address-postcode'],
    OPTIONAL_FIELDS: [],
  },
  FINANCIAL: {
    REQUIRED_FIELDS: ['supplyContractValue', 'supplyContractCurrency'],
    CONDITIONALLY_REQUIRED_FIELDS: ['supplyContractConversionRateToGBP', 'supplyContractConversionDate'],
    OPTIONAL_FIELDS: [],
  },
};

module.exports = FIELDS;
