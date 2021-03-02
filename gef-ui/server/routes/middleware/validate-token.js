import * as api from '../../services/api';

const validateToken = async (req, res, next) => {
  const { userToken } = req.session;
  if (userToken && await api.validateToken(userToken)) {
    return next();
  }

  console.log('poo', req.session.destroy(() => {
    res.redirect('/');
  }));

  return req.session.destroy(() => {
    res.redirect('/');
  });
};

export default validateToken;
