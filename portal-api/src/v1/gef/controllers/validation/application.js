const { ERROR, STATUS } = require('../../enums');

const validateNameField = (fieldName, fieldValue) => {
  if (!fieldValue) {
    return {
      errCode: ERROR.MANDATORY_FIELD,
      errRef: fieldName,
      errMsg: `${fieldName} is Mandatory`,
    };
  }
  if (fieldValue.length > 30) {
    return {
      errCode: ERROR.FIELD_TOO_LONG,
      errRef: fieldName,
      errMsg: `${fieldName} can only be up to 30 characters in length (${fieldValue})`,
    };
  }

  if (/[^A-Za-z0-9 .,;-]/.test(fieldValue)) {
    return {
      errCode: ERROR.FIELD_INVALID_CHARACTERS,
      errRef: fieldName,
      errMsg: `${fieldName} can only contain letters, numbers and punctuation (${fieldValue})`,
    };
  }

  return null;
};

const validateApplicationReferences = (body = {}) => {
  let validationErrs = [];
  validationErrs.push(validateNameField('bankInternalRefName', body.bankInternalRefName));
  if (body.additionalRefName) validationErrs.push(validateNameField('additionalRefName', body.additionalRefName));

  validationErrs = validationErrs.filter((el) => el !== null); // remove nulls
  return validationErrs.length === 0 ? null : validationErrs;
};

const validatorStatusCheckEnums = (doc) => {
  const enumErrors = [];
  switch (doc.status) {
    case STATUS.NOT_STARTED:
    case STATUS.IN_PROGRESS:
    case STATUS.CHANGES_REQUIRED:
    case STATUS.COMPLETED:
    case STATUS.BANK_CHECK:
    case STATUS.SUBMITTED_TO_UKEF:
    case STATUS.ABANDONED:
    case null:
    case undefined:
      break;
    default:
      enumErrors.push({ errCode: 'ENUM_ERROR', errMsg: 'Unrecognised enum', errRef: 'status' });
      break;
  }
  return enumErrors.length === 0 ? null : enumErrors;
};

module.exports = {
  validateApplicationReferences,
  validatorStatusCheckEnums,
};
