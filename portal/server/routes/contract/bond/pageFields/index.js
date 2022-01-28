const FIELDS = {
  DETAILS: {
    REQUIRED_FIELDS: [
      'bondType',
      'facilityStage',
    ],
    CONDITIONALLY_REQUIRED_FIELDS: [
      // required if facilityStage is 'Unissued'
      'ukefGuaranteeInMonths',

      // required if facilityStage is 'Issued'
      'coverEndDate',
      'name',

      // optional fields that could have validation errors
      'requestedCoverStartDate',
    ],
    OPTIONAL_FIELDS: [
      'bondIssuer',
      'requestedCoverStartDate',
      'bondBeneficiary',
    ],
  },
  FINANCIAL_DETAILS: {
    REQUIRED_FIELDS: [
      'value',
      'currencySameAsSupplyContractCurrency',
      'riskMarginFee',
      'coveredPercentage',
    ],
    CONDITIONALLY_REQUIRED_FIELDS: [
      // required if `currencySameAsSupplyContractCurrency` is false
      'currency',
      'conversionRate',
      'conversionRateDate',

      // optional fields that could have validation errors
      'minimumRiskMarginFee',
    ],
  },
  FEE_DETAILS: {
    REQUIRED_FIELDS: [
      'feeType',
      'feeFrequency',
      'dayCountBasis',
    ],
  },
};

module.exports = FIELDS;
