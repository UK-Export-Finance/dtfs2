const isEmptyString = (str) => {
  if (!str || ((typeof str === 'string' || str instanceof String) && !str.trim().length)) {
    return true;
  }
  return false;
};

const hasValue = (str) => {
  if (str && !isEmptyString(str)) {
    return true;
  }
  return false;
};

/**
 * Objective:
The main objective of the isValidEmail function is to validate whether a given email
address is in a correct format or not. It checks if the email address follows the standard syntax rules for email addresses.

Inputs:
- email: a string representing the email address to be validated.

Flow:
- The function takes in an email address as input.
- It creates a regular expression pattern using the regex variable.
- It uses the test method of the regex object to check if the email address matches the pattern.
- If the email address matches the pattern, the function returns true, indicating that the email address is valid. Otherwise, it returns false.

Outputs:
- true: if the email address is valid and matches the pattern.
- false: if the email address is not valid and does not match the pattern.

Additional aspects:
- The regular expression pattern used in the function checks for the standard syntax rules for
email addresses, including the presence of an "@" symbol, a domain name, and a top-level domain.
- The function does not check if the email address actually exists or is deliverable. It only checks if the email address is in a correct format.
 * @param {String} email Email address as string
 * @returns Boolean
 */
const isValidEmail = (email) => {
  const regex = /^(([^<>()[\]\\.,;:\s@\\"]+(\.[^<>()[\]\\.,;:\s@\\"]+)*)|(\\".+\\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
  return regex.test(email);
};

module.exports = {
  isEmptyString,
  hasValue,
  isValidEmail,
};
