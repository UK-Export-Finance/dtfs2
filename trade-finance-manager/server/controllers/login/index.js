const getLogin = (req, res) => res.render('login.njk');

const postLogin = (req, res) => res.redirect('/case/deal/1000676');

export default {
  getLogin,
  postLogin,
};
