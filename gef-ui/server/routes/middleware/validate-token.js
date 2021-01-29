import api from '../../api';

const validateToken = async (req, res, next) => {
  // TODO ADD REDIS so Portal & GEF can share token
  next();

  // const { userToken } = req.session;
  // if (await api.validateToken(userToken)) {
  //   next();
  // } else {
  //   req.session.destroy(() => {
  //     console.log('Invalid user token');
  //     res.redirect('/');
  //   });
  // }
};

export default validateToken;
