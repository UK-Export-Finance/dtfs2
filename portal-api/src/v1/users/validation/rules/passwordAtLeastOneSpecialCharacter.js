const regexAtLeastOneSpecialCharacter = /[^a-zA-Z0-9]+/;

/**
 * Validates that if the password is present it contains at least one special character
 * @param {object} user the existing user
 * @param {object} change the changes to make
 * @returns {Array} either an empty array or an array containing an error object
 */
const passwordAtLeastOneSpecialCharacter = (user, change) => {
  if (change && change.password && !change.password.match(regexAtLeastOneSpecialCharacter)) {
    return [
      {
        password: {
          order: '4',
          text: 'Your password must contain at least one special character.',
        },
      },
    ];
  }

  return [];
};

module.exports = passwordAtLeastOneSpecialCharacter;
