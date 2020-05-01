import {
  errorHref,
  generateErrorSummary,
} from '../../../helpers';

export const POSSIBLE_BOND_DETAILS_REQUIRED_FIELDS = [
  // required if bondStage is 'Unissued'
  'ukefGuaranteeInMonths',

  // required if bondStage is 'Issued'
  'coverEndDate',
  'uniqueIdentificationNumber',
];

export const REQUIRED_FIELDS = {
  DETAILS: [
    'bondType',
    'bondStage',
    ...POSSIBLE_BOND_DETAILS_REQUIRED_FIELDS,
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

export const shouldReturnValidation = (errorsCount, fieldsCount) => errorsCount < fieldsCount;

export const mapValidationErrors = (validationErrors, requiredFields) => {
  const mappedErrors = validationErrors || {};

  const filteredErrorList = {};

  if (validationErrors) {
    Object.keys(validationErrors.errorList).forEach((error) => {
      if (requiredFields.includes(error)) {
        filteredErrorList[error] = validationErrors.errorList[error];
      }
    });
  }

  mappedErrors.errorList = filteredErrorList;

  return {
    ...generateErrorSummary(
      mappedErrors,
      errorHref,
    ),
    conditionalErrorList: mappedErrors.conditionalErrorList,
  };
};

export const handleValidationErrors = (validationErrors, requiredFields) => {
  const mappedValidationErrors = mapValidationErrors(validationErrors, requiredFields);

  if (shouldReturnValidation(mappedValidationErrors.count, requiredFields.length)) {
    return mappedValidationErrors;
  }
  return {};
};

// NOTE: this is failing because we now pass
// POSSIBLE_BOND_DETAILS_REQUIRED_FIELDS into REQUIRED_FIELDS.DETAILS
export const handleBondDetailsValidationErrors = (validationErrors) =>
  handleValidationErrors(validationErrors, REQUIRED_FIELDS.DETAILS);

export const handleBondFinancialDetailsValidationErrors = (validationErrors) =>
  handleValidationErrors(validationErrors, REQUIRED_FIELDS.FINANCIAL_DETAILS);

export const handleBondFeeDetailsValidationErrors = (validationErrors) =>
  handleValidationErrors(validationErrors, REQUIRED_FIELDS.FEE_DETAILS);


export const handleBondPreviewValidationErrors = (validationErrors, dealId, bondId) => {
  const mappedValidationErrors = validationErrors;

  if (mappedValidationErrors && mappedValidationErrors.errorList) {
    Object.keys(mappedValidationErrors.errorList).forEach((fieldName) => {
      if (REQUIRED_FIELDS.DETAILS.includes(fieldName)) {
        mappedValidationErrors.errorList[fieldName].hrefRoot = `/contract/${dealId}/bond/${bondId}/details`;
      }

      if (REQUIRED_FIELDS.FINANCIAL_DETAILS.includes(fieldName)) {
        mappedValidationErrors.errorList[fieldName].hrefRoot = `/contract/${dealId}/bond/${bondId}/financial-details`;
      }

      if (REQUIRED_FIELDS.FEE_DETAILS.includes(fieldName)) {
        mappedValidationErrors.errorList[fieldName].hrefRoot = `/contract/${dealId}/bond/${bondId}/fee-details`;
      }
    });
  }

  return mappedValidationErrors;
};
