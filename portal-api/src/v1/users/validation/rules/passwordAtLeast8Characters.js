module.exports = (user, change) => {
  if (change && change.password && change.password.length < 8) {
    return [{
      password: {
        order: '1',
        text: 'Your password must contain at least 8 characters.',
      },
    }];
  }

  return [];
};
