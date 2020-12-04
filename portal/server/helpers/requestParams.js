const requestParams = (req) => {
  const {
    _id,
    bondId,
    loanId,
    pwdResetToken,
  } = req.params;
  const { userToken } = req.session;

  return {
    _id,
    bondId,
    loanId,
    pwdResetToken,
    userToken,
  };
};

export default requestParams;
