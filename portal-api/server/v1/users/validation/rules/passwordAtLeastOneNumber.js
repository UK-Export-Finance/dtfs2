const regexAtLeastOneNumber = /[\d]+/;

/**
 * Validates that if the password is present it contains at least one numeric character
 * @param {object} user the existing user
 * @param {object} change the changes to make
 * @returns {Array} either an empty array or an array containing an error object
 */
const passwordAtLeastOneNumber = (user, change) => {
  if (change && change.password && !change.password.match(regexAtLeastOneNumber)) {
    return [
      {
        password: {
          order: '3',
          text: 'Your password must contain at least one numeric character.',
        },
      },
    ];
  }

  return [];
};

module.exports = passwordAtLeastOneNumber;
