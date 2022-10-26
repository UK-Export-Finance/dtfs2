const Joi = require('joi');
const { validationErrorHandler } = require('../../../helpers/validationErrorHandler.helper');

/**
 * validates partyURN input
 * checks is only numbers and minimum length 3
 * constructs error object if any issues with URN input
 */
const validatePartyURN = (URNValue) => {
  // URNvalue is string so checks length and is only numbers
  const urnSchema = Joi.string().min(3).pattern(/^[0-9]+$/).required();
  const urnValidation = urnSchema.validate(URNValue);

  if (urnValidation.error) {
    const urnValidationErrors = [];
    urnValidationErrors.push({
      errRef: 'partyUrn',
      errMsg: 'Enter a correct party URN',
    });

    const errorsObject = {
      errors: validationErrorHandler(urnValidationErrors),
    };

    return { errorsObject, urn: urnValidation.value };
  }

  return {};
};

module.exports = validatePartyURN;
