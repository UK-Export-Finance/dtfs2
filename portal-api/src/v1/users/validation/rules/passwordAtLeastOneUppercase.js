const regexAtLeastOneUppercase = /[A-Z]+/;

module.exports = (user, change) => {
  if (change && change.password && !change.password.match(regexAtLeastOneUppercase)) {
    return [{
      password: {
        order: '5',
        text: 'Your password must contain at least one upper-case character.',
      },
    }];
  }

  return [];
};
