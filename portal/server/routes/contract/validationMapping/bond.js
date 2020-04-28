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


export const handleBondPreviewValidationErrors = (validationErrors, dealId, bondId) => {
  const mappedValidationErrors = validationErrors;

  Object.keys(mappedValidationErrors.errorList).forEach((error) => {
    if (REQUIRED_FIELDS.DETAILS.includes(error)) {
      mappedValidationErrors.errorList[error].hrefRoot = `/contract/${dealId}/bond/${bondId}/details`;
    }

    if (REQUIRED_FIELDS.FINANCIAL_DETAILS.includes(error)) {
      mappedValidationErrors.errorList[error].hrefRoot = `/contract/${dealId}/bond/${bondId}/financial-details`;
    }

    if (REQUIRED_FIELDS.FEE_DETAILS.includes(error)) {
      mappedValidationErrors.errorList[error].hrefRoot = `/contract/${dealId}/bond/${bondId}/fee-details`;
    }
  });

  return mappedValidationErrors;
};
