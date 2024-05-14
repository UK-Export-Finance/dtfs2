const api = require('../../services/api');

const validateToken = async (req, res, next) => {
  const { userToken } = req.session;
  if (userToken && (await api.validateToken(userToken))) {
    return next();
  }

  return req.session.destroy(() => {
    res.redirect('/');
  });
};

module.exports = validateToken;
