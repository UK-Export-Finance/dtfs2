exports.mongoStatus = (response) => {
  let status = 200;
  if (response.ok) {
    if (!response.value) {
      status = 204;
    }
  } else {
    status = 500;
  }
  return status;
};

const isSuperUser = (user) => user && user.bank && user.bank.id === '*';

exports.userHasAccess = (user, deal, roles = []) => {
  // super-users can get at anything
  if (isSuperUser(user)) return true;

  // if we've somehow got a user that doesn't have bank details; reject
  if (!user?.bank?.id) return false;

  // if the deal has no bank ID for some reason
  if (!deal?.bank?.id) return false;

  const hasRole = roles.some((role) => user.roles.includes(role));

  return user.bank.id === deal.bank.id && (!roles.length || hasRole);
};
