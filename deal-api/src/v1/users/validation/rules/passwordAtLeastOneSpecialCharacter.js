const regexAtLeastOneSpecialCharacter = /[^a-zA-Z0-9]+/;

module.exports = (user) => {
  if (user && user.password && !user.password.match(regexAtLeastOneSpecialCharacter)) {
    return [{
      password: 'Your password must contain at least one special character.',
    }];
  }

  return [];
};
