const FIELDS = {
  GUARANTEE_DETAILS: {
    REQUIRED_FIELDS: [
      'facilityStage',
    ],
    CONDITIONALLY_REQUIRED_FIELDS: [
      // required if facilityStage is 'Conditional'
      'ukefGuaranteeInMonths',

      // required if facilityStage is 'Unconditional'
      'bankReferenceNumber',
      'requestedCoverStartDate',
      'coverEndDate',
    ],
    OPTIONAL_FIELDS: [
      'bankReferenceNumber',
    ],
  },
  FINANCIAL_DETAILS: {
    REQUIRED_FIELDS: [
      'loanFacilityValue',
      'currencySameAsSupplyContractCurrency',
      'interestMarginFee',
      'coveredPercentage',
    ],
    CONDITIONALLY_REQUIRED_FIELDS: [
      // required if `currencySameAsSupplyContractCurrency` is false
      'currency',
      'conversionRate',
      'conversionRateDate',

      // TODO
      // optional fields that could have validation errors
      // find smart way to do this/rename arrays
      'minimumQuarterlyFee',
    ],
    // OPTIONAL_FIELDS: [
    //   'minimumQuarterlyFee',
    // ],
  },
};

export default FIELDS;
