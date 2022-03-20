module.exports = (user, change) => {
  if (change && change.password !== change.passwordConfirm) {
    return [{
      passwordConfirm: {
        order: '1',
        text: 'Your passwords must match.',
      },
    }];
  }

  return [];
};
