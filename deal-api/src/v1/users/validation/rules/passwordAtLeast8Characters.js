module.exports = (user) => {
  if (user && user.password && user.password.length < 8) {
    return [{
      password: 'Your password must contain at least 8 characters.',
    }];
  }

  return [];
};
