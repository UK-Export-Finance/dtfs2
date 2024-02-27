const { findByEmail } = require('../../controller');

/**
 * Ensures that if the change has an email property, it is a unique email address
 * @param {Object} user the existing user
 * @param {Object} change the changes to make
 * @returns {Promise<Array>} either an empty array or an array containing an error object if the email is not a unique email address
 */

const emailMustBeUnique = async (user, change) => {
  if (!change?.email) {
    return [];
  }

  return await findByEmail(change.email, (error, account) => {
    if (account) {
      return [
        {
          email: {
            order: '1',
            text: 'User already exists.',
          },
        },
      ];
    }
    return [];
  });
};

module.exports = emailMustBeUnique;
