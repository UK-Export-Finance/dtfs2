const Joi = require('joi');
const { validationErrorHandler } = require('../../../helpers/validationErrorHandler.helper');
const { constructErrRef } = require('./helpers');

// if URN is empty and urn is required, returns error for empty field
const emptyURNValidation = (partyUrnParams) => {
  const {
    urnValue,
    index,
    partyType,
    urnValidationErrors,
  } = partyUrnParams;

  // constructs error ref based on partyType and determines if to add index or not
  const errRef = constructErrRef(partyType, index);

  urnValidationErrors.push({
    errRef,
    errMsg: 'Enter a unique reference number',
  });

  const errorsObject = {
    errors: validationErrorHandler(urnValidationErrors),
  };

  return { errorsObject, urn: urnValue };
};

// if URN is formatted incorrectly then returns error
const invalidURNValidation = (partyUrnParams, urnValidation) => {
  const {
    index,
    partyType,
    urnValidationErrors,
  } = partyUrnParams;

  // constructs error ref based on partyType and determines if to add index or not
  const errRef = constructErrRef(partyType, index);

  urnValidationErrors.push({
    errRef,
    errMsg: 'Enter a minimum of 3 numbers',
  });

  const errorsObject = {
    errors: validationErrorHandler(urnValidationErrors),
  };

  return { errorsObject, urn: urnValidation.value };
};

/**
 * validates partyURN input
 * if empty and URN is required, then will show error for entering URN
 * if URN entered, checks is only numbers and minimum length 3
 * constructs error object if any issues with URN input
 */
const validatePartyURN = (partyUrnParams) => {
  const {
    urnValue,
    partyUrnRequired,
  } = partyUrnParams;

  if (partyUrnRequired && !urnValue) {
    return emptyURNValidation(partyUrnParams);
  }

  // URNvalue is string so checks length and is only numbers
  const urnSchema = Joi.string().min(3).pattern(/^\d+$/).required();
  const urnValidation = urnSchema.validate(urnValue);

  if (urnValue && urnValidation.error) {
    return invalidURNValidation(partyUrnParams, urnValidation);
  }

  return {};
};

module.exports = validatePartyURN;
