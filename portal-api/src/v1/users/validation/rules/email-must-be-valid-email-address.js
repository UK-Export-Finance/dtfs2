const { isValidEmail } = require('../../../../utils/string');

/**
 * Ensures that if the change has an email property, it is a valid email address
 * @param {Object} user the existing user
 * @param {Object} change the changes to make
 * @returns {Array} either an empty array or an array containing an error object if the email is not a valid email address
 */
const emailMustBeValidEmailAddress = (user, change) => {
  const changeHasEmailProperty = change?.email !== undefined;
  const changeEmailPropertyIsNotAValidEmailAddress = !(typeof change.email === 'string' && isValidEmail(change.email));

  if (changeHasEmailProperty && changeEmailPropertyIsNotAValidEmailAddress) {
    return [
      {
        email: {
          order: '1',
          text: 'Enter an email address in the correct format, for example, name@example.com',
        },
      },
    ];
  }

  return [];
};

module.exports = emailMustBeValidEmailAddress;
