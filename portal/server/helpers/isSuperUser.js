const isSuperUser = (user) =>
  user && user.bank && user.bank.id === '*';

module.exports = isSuperUser;
