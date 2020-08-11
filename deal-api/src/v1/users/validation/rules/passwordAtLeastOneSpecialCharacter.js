const regexAtLeastOneSpecialCharacter = /[^a-zA-Z0-9]+/;

module.exports = (user, change) => {
  if (change && change.password && !change.password.match(regexAtLeastOneSpecialCharacter)) {
    return [{
      password: {
        order: '4',
        text: 'Your password must contain at least one special character.',
      },
    }];
  }

  return [];
};
