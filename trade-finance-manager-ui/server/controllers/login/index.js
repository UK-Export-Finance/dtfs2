const api = require('../../api');
const { validationErrorHandler } = require('../../helpers/validationErrorHandler.helper');
const { TEAM_IDS } = require('../../constants');
const { userIsInTeam } = require('../../helpers/user');

const getLogin = (req, res) => res.render('login.njk', {
  user: req.session.user,
});

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
    const response = await api.login(email, password);

    const { success, token, user } = response;

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
      errors: validationErrorHandler(loginErrors),
    });
  }

  const { user } = req.session;
  if (userIsInTeam(user, [TEAM_IDS.PDC_READ, TEAM_IDS.PDC_RECONCILE])) {
    return res.redirect('/utilisation-reports');
  }
  return res.redirect('/deals');
};

const logout = (req, res) => {
  req.session.destroy(() => {
    res.redirect('/');
  });
};

module.exports = { getLogin, postLogin, logout };
