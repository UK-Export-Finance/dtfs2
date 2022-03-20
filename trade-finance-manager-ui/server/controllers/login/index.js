const api = require('../../api');

const getLogin = (req, res) => {
  const { passwordreset, passwordupdated } = req.query;
  return res.render('login.njk', {
    passwordreset,
    passwordupdated,
    user: req.session.user,
  });
};

const postLogin = async (req, res) => {
  const { email, password } = req.body;
  const loginErrors = [];

  const emailError = {
    errMsg: 'Enter an email address in the correct format, for example, name@example.com',
    errRef: 'email',
  };
  const passwordError = {
    errMsg: 'Enter a valid password',
    errRef: 'password',
  };

  if (!email) loginErrors.push(emailError);
  if (!password) loginErrors.push(passwordError);

  if (email && password) {
    const tokenResponse = await api.login(email, password);

    const {
      success,
      token,
      user,
    } = tokenResponse;

    if (success) {
      req.session.userToken = token;
      req.session.user = user;
    } else {
      loginErrors.push(emailError);
      loginErrors.push(passwordError);
    }
  }

  if (loginErrors.length) {
    return res.render('login.njk', {
      errors: loginErrors,
    });
  }

  return res.redirect('/deals');
};

const logout = (req, res) => {
  req.session.destroy(() => {
    res.redirect('/');
  });
};

module.exports = {
  getLogin,
  postLogin,
  logout,
};
