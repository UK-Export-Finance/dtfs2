const api = require('../../api');
const { obscureEmail } = require('../../utils/obscure-email');
const { LANDING_PAGES } = require('../../constants');

module.exports.renderCheckYourEmailPage = (req, res) => {
  const {
    session: { numberOfSendSignInLinkAttemptsRemaining, userEmail },
  } = req;

  if (typeof numberOfSendSignInLinkAttemptsRemaining !== 'number') {
    console.error('Number of send sign in link attempts remaining was not present in the session.');
    return res.render('_partials/problem-with-service.njk');
  }

  if (numberOfSendSignInLinkAttemptsRemaining > 2) {
    console.error(`Number of send sign in link attempts remaining was not within expected bounds: ${numberOfSendSignInLinkAttemptsRemaining}`);
    return res.render('_partials/problem-with-service.njk');
  }

  switch (numberOfSendSignInLinkAttemptsRemaining) {
    case 2:
      return res.render('login/check-your-email.njk');
    case 1:
      return res.render('login/new-sign-in-link-sent.njk');
    case 0:
      return res.render('login/we-have-sent-you-another-link.njk', {
        obscuredSignInLinkTargetEmailAddress: obscureEmail(userEmail),
      });
    case -1:
      return res.status(403).render('login/temporarily-suspended.njk');
    default:
      return res.redirect(LANDING_PAGES.LOGIN);
  }
};

module.exports.sendNewSignInLink = async (req, res) => {
  try {
    const signInLinkResponse = await api.sendSignInLink(req.session.userToken);

    if (signInLinkResponse?.data && typeof signInLinkResponse.data.numberOfSendSignInLinkAttemptsRemaining === 'number') {
      req.session.numberOfSendSignInLinkAttemptsRemaining = signInLinkResponse.data.numberOfSendSignInLinkAttemptsRemaining;
    } else {
      console.info('sendSignInLink returned unexpected shape', { response: signInLinkResponse });
    }
  } catch (error) {
    if (error.response?.status === 403) {
      req.session.numberOfSendSignInLinkAttemptsRemaining = -1;
    }
    if (error.response?.data && typeof error.response.data.numberOfSendSignInLinkAttemptsRemaining === 'number') {
      req.session.numberOfSendSignInLinkAttemptsRemaining = error.response.data.numberOfSendSignInLinkAttemptsRemaining;
    }

    console.info('Failed to send sign in link. The login flow will continue as the user can retry on the next page. The error was %o', error);
  }

  return res.redirect('/login/check-your-email');
};
