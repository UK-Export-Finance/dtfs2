import { Response } from 'express';
import { getCheckYourEmailAccessCodePage, GetCheckYourEmailAccessCodePageRequest } from './get-check-your-email-access-code';

describe('getCheckYourEmailAccessCodePage', () => {
  let res: Response;
  let renderMock: jest.Mock;

  beforeEach(() => {
    renderMock = jest.fn();
    res = {
      render: renderMock,
    } as unknown as Response;
  });

  it('should render the check your email access code template with attemptsLeft from the session', () => {
    const req = {
      session: {
        numberOfSignInOtpAttemptsRemaining: 2,
        userEmail: 'test@example.com',
      },
    } as unknown as GetCheckYourEmailAccessCodePageRequest;

    getCheckYourEmailAccessCodePage(req, res);

    expect(renderMock).toHaveBeenCalledTimes(1);
    expect(renderMock).toHaveBeenCalledWith('login/check-your-email-access-code.njk', {
      attemptsLeft: 2,
      requestNewCodeUrl: '/login/request-new-access-code',
      email: 'test@example.com',
    });
  });

  it('should render problem with service template when numberOfSignInOtpAttemptsRemaining is not present in the session', () => {
    const req = {
      session: {},
    } as unknown as GetCheckYourEmailAccessCodePageRequest;

    getCheckYourEmailAccessCodePage(req, res);

    expect(renderMock).toHaveBeenCalledTimes(1);
    expect(renderMock).toHaveBeenCalledWith('partials/problem-with-service.njk');
  });

  it('should render problem with service template when numberOfSignInOtpAttemptsRemaining is negative', () => {
    const req = {
      session: {
        numberOfSignInOtpAttemptsRemaining: -2,
        userEmail: 'test@example.com',
      },
    } as unknown as GetCheckYourEmailAccessCodePageRequest;

    getCheckYourEmailAccessCodePage(req, res);

    expect(renderMock).toHaveBeenCalledTimes(1);
    expect(renderMock).toHaveBeenCalledWith('partials/problem-with-service.njk');
  });

  it('should render the check your email access code template when attemptsLeft is 0', () => {
    const req = {
      session: {
        numberOfSignInOtpAttemptsRemaining: 0,
        userEmail: 'test@example.com',
      },
    } as unknown as GetCheckYourEmailAccessCodePageRequest;

    getCheckYourEmailAccessCodePage(req, res);

    expect(renderMock).toHaveBeenCalledTimes(1);
    expect(renderMock).toHaveBeenCalledWith('login/check-your-email-access-code.njk', {
      attemptsLeft: 0,
      requestNewCodeUrl: '/login/request-new-access-code',
      email: 'test@example.com',
    });
  });
});
