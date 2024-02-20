module.exports = (user, change) => {
  const error = [
    {
      email: {
        order: '1',
        text: 'Username and email must match',
      },
    },
  ];

  if (change?.username !== change?.email) {
    return error;
  }

  return [];
};
