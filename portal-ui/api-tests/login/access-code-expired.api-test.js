const { HttpStatusCode } = require('axios');
const { getAccessCodeExpiredPage } = require('../../server/controllers/login/access-code-expired-page');

describe('getAccessCodeExpiredPage', () => {
  let req;
  let res;

  beforeEach(() => {
    req = {
      session: {
        numberOfSendSignInOtpAttemptsRemaining: 2,
      },
    };
    res = {
      status: jest.fn().mockReturnThis(),
      render: jest.fn(),
    };
  });

  it('should render the access code expired template with attemptsLeft', () => {
    getAccessCodeExpiredPage(req, res);
    expect(res.status).toHaveBeenCalledWith(HttpStatusCode.Ok);
    expect(res.render).toHaveBeenCalledWith('login/access-code-expired.njk', { attemptsLeft: 2 });
  });

  it('should render problem-with-service if attemptsLeft is missing', () => {
    req.session = {};
    getAccessCodeExpiredPage(req, res);
    expect(res.status).toHaveBeenCalledWith(HttpStatusCode.InternalServerError);
    expect(res.render).toHaveBeenCalledWith('_partials/problem-with-service.njk');
  });
});
