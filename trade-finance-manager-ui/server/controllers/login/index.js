import api from '../../api';

const getLogin = (req, res) => res.render('login.njk');

const postLogin = async (req, res) => {
  const user = await api.login(req.body.email);

  if (!user) {
    return res.render('login.njk');
  }
  req.session.user = user;

  return res.redirect('/deals');
};

const logout = (req, res) => {
  req.session.destroy(() => {
    res.redirect('/');
  });
};

export default {
  getLogin,
  postLogin,
  logout,
};
