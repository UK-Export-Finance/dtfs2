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
  },
  FEE_DETAILS: {
    REQUIRED_FIELDS: [
      'feeType',
      'feeFrequency',
      'dayCountBasis',
    ],
  },
};

export const allRequiredFieldsArray = (fields) => {
  const { REQUIRED_FIELDS, CONDITIONALLY_REQUIRED_FIELDS } = fields;
  const allRequiredFields = [...REQUIRED_FIELDS];

  if (CONDITIONALLY_REQUIRED_FIELDS) {
    allRequiredFields.push(...CONDITIONALLY_REQUIRED_FIELDS);
  }

  return allRequiredFields;
};

const getFieldErrors = (validationErrors, fields) => {
  const filteredErrorList = {};

  if (validationErrors) {
    Object.keys(validationErrors.errorList).forEach((error) => {
      if (fields.includes(error)) {
        filteredErrorList[error] = validationErrors.errorList[error];
      }
    });
  }

  return filteredErrorList;
};

export const validationErrorsCount = (validationErrors, fields) => {
  const allRequiredFields = allRequiredFieldsArray(fields);
  const requiredFieldErrors = getFieldErrors(validationErrors, allRequiredFields);

  return Object.keys(requiredFieldErrors).length;
};

const hasValidationErrors = (validationErrors, fields) => {
  const errorsCount = validationErrorsCount(validationErrors, fields);

  if (errorsCount === 0) {
    return false;
  }
  return true;
};

const isCompleted = (validationErrors, fields) => {
  if (hasValidationErrors(validationErrors, fields)) {
    return false;
  }
  return true;
};

const bondCompletedStatus = (validationErrors) => ({
  bondDetails: isCompleted(validationErrors, FIELDS.DETAILS),
  bondFinancialDetails: isCompleted(validationErrors, FIELDS.FINANCIAL_DETAILS),
  bondFeeDetails: isCompleted(validationErrors, FIELDS.FEE_DETAILS),
});

export default bondCompletedStatus;
