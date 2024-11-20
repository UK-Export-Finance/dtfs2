const joi = require('joi');

const isEmptyString = (str) => {
  if (!str || ((typeof str === 'string' || str instanceof String) && !str.trim().length)) {
    return true;
  }
  return false;
};

/**
 * Check if a string has a value, i.e
 * - String is defined
 * - String is not empty
 * - String is not 'Select value'
 * @param {string}
 * @returns Boolean
 */
const hasValue = (str) => {
  if (str && !isEmptyString(str) && str !== 'Select value') {
    return true;
  }
  return false;
};

/**
 * Objective:
  The objective of the isValidEmail function is to validate whether a
  given email address is valid or not. It checks if the input is a non-empty
  string and then uses the joi library to validate the email format.

Inputs:
  email: a string representing the email address to be validated

Flow:
  1. Check if the email is a non-empty string
  2. Use the joi library to validate the email format
  3. Return true if the email is valid, false otherwise

Outputs:
  true: if the email is valid
  false: if the email is invalid

Additional aspects:
  The function uses the joi library for email validation
  The email must be at least 3 characters long and in a valid email format
  The function returns false if the input is not a non-empty string

 * @param {string} email Email address as string
 * @returns Boolean
 */
const isValidEmail = (email) => {
  if (email) {
    const validation = joi.string().email().required().validate(email);

    return !validation.error;
  }

  return false;
};

module.exports = {
  isEmptyString,
  hasValue,
  isValidEmail,
};
