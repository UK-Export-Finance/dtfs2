const { isValidEmail } = require('../../../../utils/string');

module.exports = (user, change) => {
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
