const requestParams = (req) => {
  const { _id, bondId } = req.params;
  const { userToken } = req.session;

  return { _id, bondId, userToken };
};

export default requestParams;
