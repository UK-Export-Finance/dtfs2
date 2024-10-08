const { when, resetAllWhenMocks } = require('jest-when');
const { renderCheckYourEmailPage, sendNewSignInLink } = require('./check-your-email');
const api = require('../../api');

jest.mock('../../api');

describe('renderCheckYourEmailPage', () => {
  const userEmail = 'user@example.com';
  const redactedEmail = 'u***r@example.com';

  let res;

  beforeEach(() => {
    res = { render: jest.fn(), redirect: jest.fn(), status: jest.fn().mockReturnThis() };
  });

  it.each([
    {
      session: { userEmail, numberOfSendSignInLinkAttemptsRemaining: 2 },
      expectedRenderArguments: ['login/check-your-email.njk'],
    },
    {
      session: { userEmail, numberOfSendSignInLinkAttemptsRemaining: 1 },
      expectedRenderArguments: ['login/new-sign-in-link-sent.njk'],
    },
    {
      session: { userEmail, numberOfSendSignInLinkAttemptsRemaining: 0 },
      expectedRenderArguments: ['login/we-have-sent-you-another-link.njk', { obscuredSignInLinkTargetEmailAddress: redactedEmail }],
    },
    {
      session: { userEmail, numberOfSendSignInLinkAttemptsRemaining: -1 },
      expectedRenderArguments: ['login/temporarily-suspended.njk'],
    },
  ])(
    'renders the $expectedRenderArguments.0 template if there are $session.numberOfSendSignInLinkAttemptsRemaining attempts remaining to send the sign in link',
    ({ session, expectedRenderArguments }) => {
      const req = { session };

      renderCheckYourEmailPage(req, res);

      expect(res.render).toHaveBeenCalledWith(...expectedRenderArguments);
    },
  );

  it('returns 403 if there are -1 attempts remaining to send the sign in link', () => {
    const req = { session: { userEmail, numberOfSendSignInLinkAttemptsRemaining: -1 } };

    renderCheckYourEmailPage(req, res);

    expect(res.status).toHaveBeenCalledWith(403);
  });

  it.each([
    {
      description: 'if numberOfSendSignInLinkAttemptsRemaining is greater than should be possible',
      session: { userEmail, numberOfSendSignInLinkAttemptsRemaining: 3 },
    },
    {
      description: 'if numberOfSendSignInLinkAttemptsRemaining is not a number',
      session: userEmail,
      numberOfSendSignInLinkAttemptsRemaining: 'Test String',
    },
    { description: 'if numberOfSendSignInLinkAttemptsRemaining is not present', session: userEmail },
  ])('renders the problems with service template $description', ({ session }) => {
    const req = { session };

    renderCheckYourEmailPage(req, res);

    expect(res.render).toHaveBeenCalledWith('_partials/problem-with-service.njk');
  });
});

describe('sendNewSignInLink', () => {
  const userToken = 'a token';
  const numberOfSendSignInLinkAttemptsRemaining = 1;
  let res;

  beforeEach(() => {
    jest.resetAllMocks();
    resetAllWhenMocks();
    res = {
      redirect: jest.fn(),
      render: jest.fn(),
      status: jest.fn().mockReturnThis(),
    };
  });
  let req;

  beforeEach(() => {
    req = {
      session: {
        userToken,
      },
    };
  });

  it('sends a new sign in link via the api', async () => {
    await sendNewSignInLink(req, res);

    expect(api.sendSignInLink).toHaveBeenCalledWith(userToken);
  });

  describe('given the api returns a successful response', () => {
    it('updates the number of send sign in link attempts remaining in the session', async () => {
      mockSuccessfulSendSignInLinkResponse();

      await sendNewSignInLink(req, res);

      expect(req.session.numberOfSendSignInLinkAttemptsRemaining).toBe(numberOfSendSignInLinkAttemptsRemaining);
    });

    it('redirects to the check your email page', async () => {
      mockSuccessfulSendSignInLinkResponse();

      await sendNewSignInLink(req, res);

      expect(res.redirect).toHaveBeenCalledWith('/login/check-your-email');
    });
  });

  describe('given the api returns a non success and non 403 code', () => {
    it('redirects to check your email page if the api returns a non success and non 403 status code', async () => {
      mock500SendSignInLinkResponse();

      await sendNewSignInLink(req, res);

      expect(res.redirect).toHaveBeenCalledWith('/login/check-your-email');
    });
  });

  describe('given the api returns a 403 status', () => {
    it('renders the temporarily suspended template', async () => {
      mock403SendSignInLinkResponse();

      await sendNewSignInLink(req, res);

      expect(res.redirect).toHaveBeenCalledWith('/login/check-your-email');
    });

    it('updates the number of send sign in link attempts remaining in the session to -1', async () => {
      mock403SendSignInLinkResponse();

      await sendNewSignInLink(req, res);

      expect(req.session.numberOfSendSignInLinkAttemptsRemaining).toBe(-1);
    });
  });

  function mockSuccessfulSendSignInLinkResponse() {
    when(api.sendSignInLink).calledWith(userToken).mockResolvedValue({ data: { numberOfSendSignInLinkAttemptsRemaining } });
  }

  function mockUnsuccessfulSendSignInLinkResponseWithStatusCode(statusCode) {
    const error = new Error(`Request failed with status: ${statusCode}`);
    error.response = { status: statusCode };
    when(api.sendSignInLink).calledWith(userToken).mockRejectedValue(error);
  }

  function mock403SendSignInLinkResponse() {
    mockUnsuccessfulSendSignInLinkResponseWithStatusCode(403);
  }

  function mock500SendSignInLinkResponse() {
    mockUnsuccessfulSendSignInLinkResponseWithStatusCode(500);
  }
});
