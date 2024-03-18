const regexAtLeastOneUppercase = /[A-Z]+/;

/**
 * Validates that if the password is present it contains at least one upper-case character
 * @param {Object} user the existing user
 * @param {Object} change the changes to make
 * @returns {Array} either an empty array or an array containing an error object
 */
const passwordAtLeastOneUppercase = (user, change) => {
  if (change && change.password && !change.password.match(regexAtLeastOneUppercase)) {
    return [
      {
        password: {
          order: '5',
          text: 'Your password must contain at least one upper-case character.',
        },
      },
    ];
  }

  return [];
};

module.exports = passwordAtLeastOneUppercase;
