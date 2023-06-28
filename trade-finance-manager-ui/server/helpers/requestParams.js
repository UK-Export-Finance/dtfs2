// Used to deconstruct session and param parameters for use in controllers

const requestParams = (req) => {
  const { userToken } = req.session;

  return {
    userToken,
  };
};

module.exports = requestParams;
