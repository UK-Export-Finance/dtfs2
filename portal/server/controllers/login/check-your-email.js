const api = require('../../api');

module.exports.renderCheckYourEmailPage = (req, res) => {
  const { session: { numberOfSendSignInLinkAttemptsRemaining, userEmail } } = req;

  if (typeof numberOfSendSignInLinkAttemptsRemaining !== 'number') {
    console.error('Number of send sign in link attempts remaining was not present in the session.');
    return res.render('_partials/problem-with-service.njk');
  }

  if (numberOfSendSignInLinkAttemptsRemaining <= 0) {
    // TODO DTFS2-6770: extract functionality, test, handle edge cases/errors
    const [emailAccountName, emailDomainName] = userEmail.split('@');
    const redactedEmailAccountName = `${emailAccountName[0]}***${emailAccountName[emailAccountName.length - 1]}`;
    const redactedEmail = `${redactedEmailAccountName}@${emailDomainName}`;
    return res.render('login/we-have-sent-you-another-link.njk', { signInLinkTargetEmailAddress: redactedEmail });
  }

  if (numberOfSendSignInLinkAttemptsRemaining === 1) {
    return res.render('login/new-sign-in-link-sent.njk');
  }

  return res.render('login/check-your-email.njk');
};

module.exports.sendNewSignInLink = async (req, res) => {
  const { session: { numberOfSendSignInLinkAttemptsRemaining } } = req;

  if (!numberOfSendSignInLinkAttemptsRemaining || numberOfSendSignInLinkAttemptsRemaining < 0) {
    console.error(`User attempted to send a new sign in link without any attempts remaining. Attempts remaining count is ${numberOfSendSignInLinkAttemptsRemaining}.`);
    return res.render('_partials/problem-with-service.njk');
  }

  // TODO DTFS2-6770: concurrency? move to db?
  req.session.numberOfSendSignInLinkAttemptsRemaining = numberOfSendSignInLinkAttemptsRemaining - 1;

  // TODO DTFS2-6770: auth
  try {
    await api.sendSignInLink(req.session.userToken);
  } catch (error) {
    console.warn(
      'Failed to send sign in link. The login flow will continue as the user can retry on the next page. The error was: %O',
      error,
    );
  }

  return res.redirect('/login/check-your-email');
};
