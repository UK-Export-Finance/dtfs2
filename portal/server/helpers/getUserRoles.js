const { MAKER, CHECKER } = require('../constants/roles');

const getUserRoles = (roles) => {
  const isMaker = roles.includes(MAKER);
  const isChecker = roles.includes(CHECKER);

  return {
    isMaker,
    isChecker,
  };
};

module.exports = getUserRoles;
