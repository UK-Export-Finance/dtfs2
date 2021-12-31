const isSuperUser = (user) => user && user.bank && user.bank.id === '*';

const userHasAccessTo = (user, resource) => {
  // super-users can get at anything
  if (isSuperUser(user)) {
    return true;
  }

  // if we've somehow got a user that doesn't have bank details; reject
  if (!user || !user.bank || !user.bank.id) {
    return false;
  }

  // if we've somehow got a resource that doesn't have an owning bank; reject
  // this one is up for some debate but i figure better safe than sorry...
  if (!resource || !resource.details || !resource.bank) {
    return false;
  }

  // ownership check..
  return user.bank.id === resource.bank.id;
};

const userOwns = (user, resource) =>
  user._id.toString() === resource.details.maker._id.toString();// eslint-disable-line no-underscore-dangle

module.exports = {
  isSuperUser,
  userHasAccessTo,
  userOwns,
};
