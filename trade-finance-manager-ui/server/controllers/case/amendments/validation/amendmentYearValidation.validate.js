const Joi = require('joi');

/**
 * @param {String} year
 * @returns {Boolean}
 * function to validate year on amendment pages contains 4 numbers only
 * returns true if validation error
 */
const amendmentmentYearValidation = (year) => {
  // validates the year is 4 digits long and only numbers and returns error in validation if not
  const schema = Joi.string().length(4).pattern(/^[0-9]+$/).required();
  const validation = schema.validate(year);

  if (validation.error) {
    return true;
  }

  return false;
};

module.exports = amendmentmentYearValidation;
