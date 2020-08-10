const regexAtLeastOneSpecialCharacter = /[^a-zA-Z0-9]+/;

module.exports = (user) => {
  if (user && user.password && !user.password.match(regexAtLeastOneSpecialCharacter)) {
    return [{
      password: {
        order: '4',
        text: 'Your password must contain at least one special character.',
      },
    }];
  }

  return [];
};
