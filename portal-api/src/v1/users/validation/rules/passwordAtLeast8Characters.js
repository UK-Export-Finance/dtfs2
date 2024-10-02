/**
 * Validates that if the password is present it is at least 8 characters long
 * @param {Object} user the existing user
 * @param {Object} change the changes to make
 * @returns {Array} either an empty array or an array containing an error object
 */
const passwordAtLeast8Characters = (user, change) => {
  if (Object.prototype.hasOwnProperty.call(change, 'password')) {
    if (!change.password || change?.password.length < 8) {
      return [
        {
          password: {
            order: '1',
            text: 'Your password must contain at least 8 characters.',
          },
        },
      ];
    }
  }

  return [];
};

module.exports = passwordAtLeast8Characters;
