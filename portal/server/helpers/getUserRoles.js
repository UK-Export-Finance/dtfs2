const { MAKER, CHECKER, PAYMENT_OFFICER, ADMIN, READ_ONLY } = require('../constants/roles');

const getUserRoles = (roles) => {
  const isMaker = roles.includes(MAKER);
  const isChecker = roles.includes(CHECKER);
  const isPaymentOfficer = roles.includes(PAYMENT_OFFICER);
  const isAdmin = roles.includes(ADMIN);
  const isReadOnly = roles.includes(READ_ONLY);

  return {
    isMaker,
    isChecker,
    isPaymentOfficer,
    isAdmin,
    isReadOnly,
  };
};

module.exports = getUserRoles;
