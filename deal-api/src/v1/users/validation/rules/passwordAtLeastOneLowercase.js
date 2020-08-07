const regexAtLeastOneLowercase = /[a-z]+/;

module.exports = (user) => {
  if (user && user.password && !user.password.match(regexAtLeastOneLowercase)) {
    return [{
      password: 'Your password must contain at least one lower-case character.',
    }];
  }

  return [];
};
