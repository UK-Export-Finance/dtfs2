const isSuperUser = (user) => user.bank.id === '*';

const userHasAccessTo = (user, resource) => isSuperUser(user) || user.bank.id === resource.details.owningBank.id;

module.exports = {
  isSuperUser,
  userHasAccessTo,
};
