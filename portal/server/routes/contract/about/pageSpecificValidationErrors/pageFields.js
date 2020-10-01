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
      'supplier-correspondence-address-line-1',
      'supplier-correspondence-address-postcode',
      'supplier-correspondence-address-town',
      'supplier-correspondence-address-country',
      'indemnifier-name',
      'indemnifier-address-line-1',
      'indemnifier-address-postcode',
      'indemnifier-address-town',
      'indemnifier-address-country',
      'indemnifier-correspondence-address-line-1',
      'indemnifier-correspondence-address-postcode',
      'indemnifier-correspondence-address-town',
      'indemnifier-correspondence-address-country',
    ],
    OPTIONAL_FIELDS: [],
  },
  BUYER: {
    REQUIRED_FIELDS: [
      'destinationOfGoodsAndServices',
    ],
    OPTIONAL_FIELDS: [],
  },
  FINANCIAL: {
    REQUIRED_FIELDS: [
      'supplyContractValue',
      'supplyContractCurrency',
      'supplyContractConversionRateToGBP',
      'supplyContractValue',
    ],
    OPTIONAL_FIELDS: [],
  },
};

export default FIELDS;
