const isSuperUser = (user) =>
  user?.bank?.id === '*';

module.exports = isSuperUser;
