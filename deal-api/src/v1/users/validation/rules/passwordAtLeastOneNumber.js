const regexAtLeastOneNumber = /[\d]+/;

module.exports = (user) => {
  if (user && user.password && !user.password.match(regexAtLeastOneNumber)) {
    return [{
      password: {
        order: '3',
        text: 'Your password must contain at least one numeric character.',
      },
    }];
  }

  return [];
};
