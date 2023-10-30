const requestParams = (req) => {
  const {
    _id,
    bondId,
    loanId,
    pwdResetToken,
    loginAuthenticationToken,
  } = req.params;
  const { userToken } = req.session;

  return {
    _id,
    bondId,
    loanId,
    pwdResetToken,
    loginAuthenticationToken,
    userToken,
  };
};

module.exports = requestParams;
