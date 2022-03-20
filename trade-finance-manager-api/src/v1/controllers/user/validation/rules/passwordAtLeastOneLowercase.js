const regexAtLeastOneLowercase = /[a-z]+/;

module.exports = (user, change) => {
  if (change && change.password && !change.password.match(regexAtLeastOneLowercase)) {
    return [{
      password: {
        order: '2',
        text: 'Your password must contain at least one lower-case character.',
      },
    }];
  }

  return [];
};
