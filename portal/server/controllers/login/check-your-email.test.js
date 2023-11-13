const { renderCheckYourEmailPage, sendNewSignInLink } = require('./check-your-email');
const api = require('../../api');

jest.mock('../../api');

describe('renderCheckYourEmailPage', () => {
  const userEmail = 'user@example.com';
  const redactedEmail = 'u***r@example.com';

  let res;

  beforeEach(() => {
    res = { render: jest.fn() };
  });

  it.each([
    { session: { userEmail, numberOfSendSignInLinkAttemptsRemaining: 2 }, expectedRenderArguments: ['login/check-your-email.njk'] },
    { session: { userEmail, numberOfSendSignInLinkAttemptsRemaining: 1 }, expectedRenderArguments: ['login/new-sign-in-link-sent.njk'] },
    { session: { userEmail, numberOfSendSignInLinkAttemptsRemaining: 0 }, expectedRenderArguments: ['login/we-have-sent-you-another-link.njk', { signInLinkTargetEmailAddress: redactedEmail }] },
    { session: { userEmail, numberOfSendSignInLinkAttemptsRemaining: -1 }, expectedRenderArguments: ['login/we-have-sent-you-another-link.njk', { signInLinkTargetEmailAddress: redactedEmail }] },
  ])('renders the $expectedRenderArguments.0 template if there are $session.numberOfSendSignInLinkAttemptsRemaining attempts remaining to send the sign in link', ({
    session, expectedRenderArguments,
  }) => {
    const req = { session };

    renderCheckYourEmailPage(req, res);

    expect(res.render).toHaveBeenCalledWith(...expectedRenderArguments);
  });

  it('renders the problem with service page if the number of attempts remaining to send the sign in link is not defined', () => {
    const req = { session: {} };

    renderCheckYourEmailPage(req, res);

    expect(res.render).toHaveBeenCalledWith('_partials/problem-with-service.njk');
  });
});

describe('sendNewSignInLink', () => {
  const userToken = 'a token';
  const res = { redirect: jest.fn(), render: jest.fn() };

  beforeEach(() => {
    jest.resetAllMocks();
  });

  describe('when the number of attempts remaining to send the sign in link is more than 0', () => {
    const originalNumberOfSendSignInLinkAttemptsRemaining = 1;
    let req;

    beforeEach(() => {
      req = {
        session: {
          userToken,
          numberOfSendSignInLinkAttemptsRemaining: originalNumberOfSendSignInLinkAttemptsRemaining,
        },
      };
    });

    it('sends a new sign in link via the api', async () => {
      await sendNewSignInLink(req, res);

      expect(api.sendSignInLink).toHaveBeenCalledWith(userToken);
    });

    describe('when sending the new sign in link succeeds', () => {
      it('decreases the number of send sign in link attempts remaining by 1', async () => {
        await sendNewSignInLink(req, res);

        expect(originalNumberOfSendSignInLinkAttemptsRemaining - req.session.numberOfSendSignInLinkAttemptsRemaining).toBe(1);
      });

      it('renders the login/check-your-email template', async () => {
        await sendNewSignInLink(req, res);

        expect(res.redirect).toHaveBeenCalledWith('/login/check-your-email');
      });
    });

    describe('when sending the new sign in link fails', () => {
      beforeEach(() => {
        api.sendSignInLink.mockRejectedValueOnce(new Error('test error'));
      });

      it('decreases the number of send sign in link attempts remaining by 1', async () => {
        await sendNewSignInLink(req, res);

        expect(originalNumberOfSendSignInLinkAttemptsRemaining - req.session.numberOfSendSignInLinkAttemptsRemaining).toBe(1);
      });

      it('renders the login/check-your-email template', async () => {
        await sendNewSignInLink(req, res);

        expect(res.redirect).toHaveBeenCalledWith('/login/check-your-email');
      });
    });
  });

  describe.each([{
    description: '0', testValue: 0,
  }, {
    description: 'less than 0', testValue: -1,
  }, {
    description: 'not defined', testValue: undefined,
  }])('when the number of attempts remaining to send the sign in link is $description', ({ testValue }) => {
    const req = {
      session: {
        userToken,
        numberOfSendSignInLinkAttemptsRemaining: testValue,
      },
    };

    it('does not send a new sign in link', async () => {
      await sendNewSignInLink(req, res);

      expect(api.sendSignInLink).not.toHaveBeenCalled();
    });

    it('renders the problem with service page', async () => {
      await sendNewSignInLink(req, res);

      expect(res.render).toHaveBeenCalledWith('_partials/problem-with-service.njk');
    });
  });
});
