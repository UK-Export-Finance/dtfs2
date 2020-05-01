import {
  errorHref,
  generateErrorSummary,
} from '../../../helpers';

export const FIELDS = {
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
  },
  FINANCIAL_DETAILS: {
    REQUIRED_FIELDS: [
      'bondValue',
      'transactionCurrencySameAsSupplyContractCurrency',
      'riskMarginFee',
      'coveredPercentage',
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

export const shouldReturnValidation = (errorsCount, fieldsCount) => errorsCount < fieldsCount;

export const mapValidationErrors = (validationErrors, fields) => {
  const mappedErrors = validationErrors || {};
  const { REQUIRED_FIELDS, CONDITIONALLY_REQUIRED_FIELDS } = fields;

  const filteredErrorList = {};

  if (validationErrors) {
    Object.keys(validationErrors.errorList).forEach((error) => {
      if (REQUIRED_FIELDS.includes(error)) {
        filteredErrorList[error] = validationErrors.errorList[error];
      } else if (CONDITIONALLY_REQUIRED_FIELDS && CONDITIONALLY_REQUIRED_FIELDS.includes(error)) {
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

export const handleValidationErrors = (validationErrors, fields) => {
  const { REQUIRED_FIELDS } = fields;

  const mappedValidationErrors = mapValidationErrors(validationErrors, fields);

  if (shouldReturnValidation(mappedValidationErrors.count, REQUIRED_FIELDS.length)) {
    return mappedValidationErrors;
  }
  return {};
};

export const handleBondDetailsValidationErrors = (validationErrors) =>
  handleValidationErrors(validationErrors, FIELDS.DETAILS);

export const handleBondFinancialDetailsValidationErrors = (validationErrors) =>
  handleValidationErrors(validationErrors, FIELDS.FINANCIAL_DETAILS);

export const handleBondFeeDetailsValidationErrors = (validationErrors) =>
  handleValidationErrors(validationErrors, FIELDS.FEE_DETAILS);

export const handleBondPreviewValidationErrors = (validationErrors, dealId, bondId) => {
  const mappedValidationErrors = validationErrors;

  if (mappedValidationErrors && mappedValidationErrors.errorList) {
    // TODO update - this won't work as DETAILS... no longer an array
    Object.keys(mappedValidationErrors.errorList).forEach((fieldName) => {
      if (FIELDS.DETAILS.REQUIRED_FIELDS.includes(fieldName)) {
        mappedValidationErrors.errorList[fieldName].hrefRoot = `/contract/${dealId}/bond/${bondId}/details`;
      }

      if (FIELDS.FINANCIAL_DETAILS.REQUIRED_FIELDS.includes(fieldName)) {
        mappedValidationErrors.errorList[fieldName].hrefRoot = `/contract/${dealId}/bond/${bondId}/financial-details`;
      }

      if (FIELDS.FEE_DETAILS.REQUIRED_FIELDS.includes(fieldName)) {
        mappedValidationErrors.errorList[fieldName].hrefRoot = `/contract/${dealId}/bond/${bondId}/fee-details`;
      }
    });
  }

  return mappedValidationErrors;
};
