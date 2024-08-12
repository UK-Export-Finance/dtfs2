/**
 * Ensures that if the change has either an email or username property, both exist and are the same
 * @param {object} user the existing user
 * @param {object} change the changes to make
 * @returns {Array} either an empty array or an array containing an error object
 */
const usernameAndEmailMustMatch = (user, change) => {
  const error = [
    {
      email: {
        order: '1',
        text: 'Username and email must match',
      },
    },
  ];

  if (change?.username !== change?.email) {
    return error;
  }

  return [];
};

module.exports = usernameAndEmailMustMatch;
