const requestParams = (req) => {
  const { _id, bondId, loanId, pwdResetToken, signInToken } = req.params;
  const { userToken } = req.session;

  return {
    _id,
    bondId,
    loanId,
    pwdResetToken,
    signInToken,
    userToken,
  };
};

module.exports = requestParams;
