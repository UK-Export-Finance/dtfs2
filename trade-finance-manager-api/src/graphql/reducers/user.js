const userReducer = (user) => {
  const {
    _id,
    firstName,
    lastName,
    email,
  } = user;

  return {
    _id,
    firstName,
    lastName,
    email,
  };
};

module.exports = userReducer;
