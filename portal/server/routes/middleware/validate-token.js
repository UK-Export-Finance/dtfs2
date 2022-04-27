const api = require('../../api');

const validateToken = async (req, res, next) => {
  const { userToken } = req.session;

  if (await api.validateToken(userToken)) {
    next();
  } else {
    req.session.destroy(() => {
      res.redirect('/login');
    });
  }
};

module.exports = validateToken;
