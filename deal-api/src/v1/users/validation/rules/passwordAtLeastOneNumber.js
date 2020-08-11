const regexAtLeastOneNumber = /[\d]+/;

module.exports = (user, change) => {
  if (change && change.password && !change.password.match(regexAtLeastOneNumber)) {
    return [{
      password: {
        order: '3',
        text: 'Your password must contain at least one numeric character.',
      },
    }];
  }

  return [];
};
