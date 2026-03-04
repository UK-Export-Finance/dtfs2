import { Response } from 'express';
import { getCheckYourEmailAccessCodePage, GetCheckYourEmailAccessCodePageRequest } from './get-check-your-email-access-code';

describe('controllers/login/get-check-your-email-access-code', () => {
  let res: Response;
  let renderMock: jest.Mock;
  let redirectMock: jest.Mock;

  beforeEach(() => {
    renderMock = jest.fn();
    redirectMock = jest.fn();
    res = {
      render: renderMock,
      redirect: redirectMock,
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
      isAccessCodeLink: true,
      isSupportInfo: false,
      email: 'test@example.com',
    });
  });

  it('should redirect to not-found when attemptsLeft is not present in the session', () => {
    const req = {
      session: {},
    } as unknown as GetCheckYourEmailAccessCodePageRequest;

    getCheckYourEmailAccessCodePage(req, res);

    expect(redirectMock).toHaveBeenCalledTimes(1);
    expect(redirectMock).toHaveBeenCalledWith('/not-found');
  });

  it('should redirect to not-found when attemptsLeft is negative', () => {
    const req = {
      session: {
        numberOfSignInOtpAttemptsRemaining: -2,
        userEmail: 'test@example.com',
      },
    } as unknown as GetCheckYourEmailAccessCodePageRequest;

    getCheckYourEmailAccessCodePage(req, res);

    expect(redirectMock).toHaveBeenCalledTimes(1);
    expect(redirectMock).toHaveBeenCalledWith('/not-found');
  });
});
