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
      'currency',
      'conversionRate',
      'conversionRateDate',
    ],
    OPTIONAL_FIELDS: [
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
