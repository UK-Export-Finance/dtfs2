const { ERROR, STATUS } = require('../../enums');

const validateMandatoryField = (fieldName, fieldValue) => {
  const value = fieldValue ?? '';
  if (value.length <= 0) {
    return {
      errCode: ERROR.MANDATORY_FIELD,
      errRef: fieldName,
      errMsg: `${fieldName} is Mandatory`,
    };
  }

  return null;
};

const validateNameFieldValue = (fieldName, fieldValue) => {
  const value = fieldValue ?? '';
  if (value.length > 30) {
    return {
      errCode: ERROR.FIELD_TOO_LONG,
      errRef: fieldName,
      errMsg: `${fieldName} can only be up to 30 characters in length (${fieldValue})`,
    };
  }

  if (/[^A-Za-z0-9 .,:;'-]/.test(fieldValue)) {
    return {
      errCode: ERROR.FIELD_INVALID_CHARACTERS,
      errRef: fieldName,
      errMsg: `${fieldName} can only contain letters, numbers and punctuation (${fieldValue})`,
    };
  }

  return null;
};

const validateApplicationReferences = (body = {}) => {
  let validationErrors = [];

  if (Object.keys(body).includes('bankInternalRefName')) {
    validationErrors.push(validateMandatoryField('bankInternalRefName', body.bankInternalRefName));
    validationErrors.push(validateNameFieldValue('bankInternalRefName', body.bankInternalRefName));
  }
  if (body.additionalRefName) validationErrors.push(validateNameFieldValue('additionalRefName', body.additionalRefName));

  validationErrors = validationErrors.filter((el) => el !== null); // remove nulls
  return validationErrors.length === 0 ? null : validationErrors;
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
