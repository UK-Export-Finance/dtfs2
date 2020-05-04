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
  },
  FEE_DETAILS: {
    REQUIRED_FIELDS: [
      'feeType',
      'feeFrequency',
      'dayCountBasis',
    ],
  },
};

// only return validation if any single field has been submitted (required, conditionally required or optional).
export const shouldReturnRequirdValidation = (fields, fieldValues) => {
  const allFields = [];

  Object.keys(fields).forEach((fieldTypeGroup) => {
    allFields.push(...fields[fieldTypeGroup]);
  });

  // probably better way to do this...
  const fieldValuesWithoutIdAndStatus = {
    ...fieldValues,
  };
  delete fieldValuesWithoutIdAndStatus._id; // eslint-disable-line no-underscore-dangle
  delete fieldValuesWithoutIdAndStatus.status;

  const totalFieldValues = Object.keys(fieldValuesWithoutIdAndStatus).filter((fieldName) => {
    if (fieldValuesWithoutIdAndStatus[fieldName].length > 0) {
      return fieldName;
    }
    return null;
  });

  if (totalFieldValues.length > 0) {
    return true;
  }
  return false;
};


export const mapRequiredValidationErrors = (validationErrors, fields) => {
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

export const handleValidationErrors = (validationErrors, fields, bond) => {
  if (shouldReturnRequirdValidation(fields, bond)) {
    return mapRequiredValidationErrors(validationErrors, fields);
  }
  return {
    conditionalErrorList: validationErrors.conditionalErrorList,
  };
};

export const handleBondDetailsValidationErrors = (validationErrors, bond) =>
  handleValidationErrors(validationErrors, FIELDS.DETAILS, bond);

export const handleBondFinancialDetailsValidationErrors = (validationErrors, bond) =>
  handleValidationErrors(validationErrors, FIELDS.FINANCIAL_DETAILS, bond);

export const handleBondFeeDetailsValidationErrors = (validationErrors, bond) =>
  handleValidationErrors(validationErrors, FIELDS.FEE_DETAILS, bond);

// preview pages display all required field validation errors.
// because each field/validation error originates from  a different page,
// for each validation error, we need to add a hrefRoot to the page in question.
export const handleBondPreviewValidationErrors = (validationErrors, dealId, bondId) => {
  const mappedValidationErrors = validationErrors;

  if (mappedValidationErrors && mappedValidationErrors.errorList) {
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
