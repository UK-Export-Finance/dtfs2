const REQUIRED_FIELDS = {
  DETAILS: [
    'bondIssuer',
    'bondType',
    'bondStage',
    'bondBeneficiary',
  ],
  FINANCIAL_DETAILS: [
    'bondValue',
    'transactionCurrencySameAsSupplyContractCurrency',
    'riskMarginFee',
    'coveredPercentage',
  ],
  FEE_DETAILS: [
    'feeType',
    'feeFrequency',
    'dayCountBasis',
  ],
};

const mapValidationErrors = (validationErrors, requiredFields) => {
  const mappedErrors = validationErrors;

  const filteredErrorList = {};

  Object.keys(validationErrors.errorList).forEach((error) => {
    if (requiredFields.includes(error)) {
      filteredErrorList[error] = validationErrors.errorList[error];
    }
  });

  mappedErrors.errorList = filteredErrorList;

  return mappedErrors;
};

export const mapBondDetailsValidationErrors = (validationErrors) =>
  mapValidationErrors(validationErrors, REQUIRED_FIELDS.DETAILS);

export const mapBondFinancialDetailsValidationErrors = (validationErrors) =>
  mapValidationErrors(validationErrors, REQUIRED_FIELDS.FINANCIAL_DETAILS);

export const mapBondFeeDetailsValidationErrors = (validationErrors) =>
  mapValidationErrors(validationErrors, REQUIRED_FIELDS.FEE_DETAILS);
