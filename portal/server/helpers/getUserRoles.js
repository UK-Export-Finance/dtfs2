const { MAKER, CHECKER, PAYMENT_REPORT_OFFICER, ADMIN, READ_ONLY } = require('../constants/roles');

const defaultResult = {
  isMaker: false,
  isChecker: false,
  isPaymentReportOfficer: false,
  isAdmin: false,
  isReadOnly: false,
};

const getUserRoles = (roles) => {
  if (!roles) return defaultResult;

  const isMaker = roles.includes(MAKER);
  const isChecker = roles.includes(CHECKER);
  const isPaymentReportOfficer = roles.includes(PAYMENT_REPORT_OFFICER);
  const isAdmin = roles.includes(ADMIN);
  const isReadOnly = roles.includes(READ_ONLY);

  return {
    isMaker,
    isChecker,
    isPaymentReportOfficer,
    isAdmin,
    isReadOnly,
  };
};

module.exports = getUserRoles;
