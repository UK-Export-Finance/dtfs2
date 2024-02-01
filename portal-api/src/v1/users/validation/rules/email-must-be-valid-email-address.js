const { isValidEmail } = require('../../../../utils/string');

module.exports = (user, change) => {
  if (change && change.email !== undefined && !(typeof change.email === 'string' && isValidEmail(change.email))) {
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
