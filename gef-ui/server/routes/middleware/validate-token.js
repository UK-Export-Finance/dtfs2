import * as Api from '../../services/api';

const validateToken = async (req, res, next) => {
  const { userToken } = req.session;
  if (userToken && await Api.validateToken(userToken)) {
    return next();
  }

  return req.session.destroy(() => {
    res.redirect('/');
  });
};

export default validateToken;
