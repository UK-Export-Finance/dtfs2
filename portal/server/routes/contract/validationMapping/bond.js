import {
  errorHref,
  generateErrorSummary,
} from '../../../helpers';

export const REQUIRED_FIELDS = {
  DETAILS: [
    'bondType',
    'bondStage',
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

  return generateErrorSummary(
    mappedErrors,
    errorHref,
  );
};

export const shouldReturnValidation = (errorsCount, fieldsCount) =>
  errorsCount < fieldsCount;


export const handleBondDetailsValidationErrors = (validationErrors) => {
  const mappedValidationErrors = mapValidationErrors(validationErrors, REQUIRED_FIELDS.DETAILS);

  if (shouldReturnValidation(
    mappedValidationErrors.count,
    REQUIRED_FIELDS.DETAILS.length,
  )) {
    return mappedValidationErrors;
  }
  return {};
};

export const handleBondFinancialDetailsValidationErrors = (validationErrors) => {
  const mappedValidationErrors = mapValidationErrors(validationErrors, REQUIRED_FIELDS.FINANCIAL_DETAILS);

  if (shouldReturnValidation(
    mappedValidationErrors.count,
    REQUIRED_FIELDS.FINANCIAL_DETAILS.length,
  )) {
    return mappedValidationErrors;
  }
  return {};
};

export const handleBondFeeDetailsValidationErrors = (validationErrors) => {
  const mappedValidationErrors = mapValidationErrors(validationErrors, REQUIRED_FIELDS.FEE_DETAILS);

  if (shouldReturnValidation(
    mappedValidationErrors.count,
    REQUIRED_FIELDS.FEE_DETAILS.length,
  )) {
    return mappedValidationErrors;
  }
  return {};
};
