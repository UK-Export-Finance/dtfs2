const FIELDS = {
  DETAILS: {
    REQUIRED_FIELDS: [
      'bondType',
      'bondStage',
    ],
    CONDITIONALLY_REQUIRED_FIELDS: [
      // required if bondStage is 'Unissued'
      'ukefGuaranteeInMonths',

      // required if bondStage is 'Issued'
      'coverEndDate',
      'uniqueIdentificationNumber',

      // TODO
      // optional fields that could have validation errors
      // feels like this should be in it's own array OR
      // maybe change requiredFieldsArray usage in filterErrorList function
      // requiredFieldsArray could be e.g fieldsThatCanHaveErrorsArray
      // and then pass OPTIONAL_FIELDS in so it's not just checking for required fields
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
      'bondValue',
      'transactionCurrencySameAsSupplyContractCurrency',
      'riskMarginFee',
      'coveredPercentage',
    ],
    CONDITIONALLY_REQUIRED_FIELDS: [
      // required if `transactionCurrencySameAsSupplyContractCurrency` is false
      'currency',
      'conversionRate',
      'conversionRateDate',


      // TODO (as above)
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

export default FIELDS;
