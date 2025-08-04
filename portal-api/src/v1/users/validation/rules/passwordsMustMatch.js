/**
 * Validate that if the password is present it matches the passwordConfirm field
 * @param {object} user the existing user
 * @param {object} change the changes to make
 * @returns {Array} either an empty array or an array containing an error object
 */
const passwordsMustMatch = (user, change) => {
  if (change && change.password !== change.passwordConfirm) {
    return [
      {
        passwordConfirm: {
          order: '1',
          text: 'Your passwords must match.',
        },
      },
    ];
  }

  return [];
};

module.exports = passwordsMustMatch;
