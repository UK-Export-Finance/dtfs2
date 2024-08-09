const regexAtLeastOneLowercase = /[a-z]+/;

/**
 * Validates that if the password is present it is at least 8 characters long
 * @param {object} user the existing user
 * @param {object} change the changes to make
 * @returns {Array} either an empty array or an array containing an error object
 */
const passwordAtLeastOneLowercase = (user, change) => {
  if (change && change.password && !change.password.match(regexAtLeastOneLowercase)) {
    return [
      {
        password: {
          order: '2',
          text: 'Your password must contain at least one lower-case character.',
        },
      },
    ];
  }

  return [];
};

module.exports = passwordAtLeastOneLowercase;
