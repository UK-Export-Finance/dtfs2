const Joi = require('joi');

/**
 * function to validate interest percentage
 * checks if between 0.0001 and 99
 * checks if no more than 4 decimal places
 * precision(4) = 4 decimal places
 * min(0.0001) = minimum value of 0.0001
 * max(99) = max value of 99
 * if any errors, then returns false
 * else true
 */
const interestPercentageValidation = ((interestPercentage) => {
  const schema = Joi.number().precision(4).strict().min(0.0001)
    .max(99)
    .required()
    .strict();
  // convert to number as stored as string
  const validation = schema.validate(Number(interestPercentage));

  // error object does not exist if no errors in validation
  if (validation.error) {
    return false;
  }

  return true;
});

const validateFacilityValue = (({ interestPercentage, coverPercentage }, saveAndReturn = false) => {
  const facilityValueErrors = [];
  // Regex tests to see if value between 1 and 80
  const oneToEightyRegex = /^(?:[1-9]|[1-7][0-9]|80)$/;

  const coverPercentageError = {
    errRef: 'coverPercentage',
    errMsg: 'You can only enter a number between 1 and 80',
  };
  const interestPercentageError = {
    errRef: 'interestPercentage',
    errMsg: 'You can only enter a number between 0.0001 and 99 and can have up to 4 decimal places',
  };
  if (saveAndReturn) {
    if (coverPercentage && !oneToEightyRegex.test(coverPercentage)) {
      facilityValueErrors.push(coverPercentageError);
    }
    if (interestPercentage && !interestPercentageValidation(interestPercentage)) {
      facilityValueErrors.push(interestPercentageError);
    }
  } else {
    if (!oneToEightyRegex.test(coverPercentage)) {
      facilityValueErrors.push(coverPercentageError);
    }
    if (!interestPercentageValidation(interestPercentage)) {
      facilityValueErrors.push(interestPercentageError);
    }
  }
  return facilityValueErrors;
});

module.exports = { validateFacilityValue, interestPercentageValidation };
