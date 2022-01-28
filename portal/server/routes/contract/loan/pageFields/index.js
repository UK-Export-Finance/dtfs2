const FIELDS = {
  GUARANTEE_DETAILS: {
    REQUIRED_FIELDS: [
      'facilityStage',
    ],
    CONDITIONALLY_REQUIRED_FIELDS: [
      // required if facilityStage is 'Conditional'
      'ukefGuaranteeInMonths',

      // required if facilityStage is 'Unconditional'
      'name',
      'requestedCoverStartDate',
      'coverEndDate',
    ],
    OPTIONAL_FIELDS: [
      'name',
    ],
  },
  FINANCIAL_DETAILS: {
    REQUIRED_FIELDS: [
      'value',
      'currencySameAsSupplyContractCurrency',
      'interestMarginFee',
      'coveredPercentage',
    ],
    CONDITIONALLY_REQUIRED_FIELDS: [
      // required if facilityStage is 'Unconditional'
      'disbursementAmount',
      // required if `currencySameAsSupplyContractCurrency` is false
      'currency',
      'conversionRate',
      'conversionRateDate',

      // optional fields that could have validation errors
      'minimumQuarterlyFee',
    ],
  },
  DATES_REPAYMENTS: {
    REQUIRED_FIELDS: [
      'premiumType',
      'premiumFrequency',
      'dayCountBasis',
    ],
  },
};

module.exports = FIELDS;
