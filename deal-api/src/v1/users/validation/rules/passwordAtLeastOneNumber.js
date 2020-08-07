const regexAtLeastOneNumber = /[\d]+/;

module.exports = (user) => {
  if (user && user.password && !user.password.match(regexAtLeastOneNumber)) {
    return [{
      password: 'Your password must contain at least one numeric character.',
    }];
  }

  return [];
};
