import { Response } from 'express';
import { getResendAnotherAccessCodePage, GetResendAnotherAccessCodePageRequest } from './get-resend-another-access-code';

describe('controllers/login/get-resend-another-access-code', () => {
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

  console.error = jest.fn();

  it('should render the resend another access code template with attemptsLeft from the session', () => {
    const req = {
      session: {
        numberOfSignInOtpAttemptsRemaining: 0,
        userEmail: 'test@example.com',
      },
    } as unknown as GetResendAnotherAccessCodePageRequest;

    getResendAnotherAccessCodePage(req, res);

    expect(renderMock).toHaveBeenCalledWith('login/resend-another-access-code.njk', {
      attemptsLeft: 0,
      requestNewCodeUrl: '/login/request-new-access-code',
      email: 'test@example.com',
    });
  });

  it('should redirect to not-found when attemptsLeft is not present in the session', () => {
    const req = {
      session: {},
    } as unknown as GetResendAnotherAccessCodePageRequest;

    getResendAnotherAccessCodePage(req, res);

    expect(redirectMock).toHaveBeenCalledTimes(1);
    expect(redirectMock).toHaveBeenCalledWith('/not-found');
  });

  it('should redirect to not-found when attemptsLeft is negative', () => {
    const req = {
      session: {
        numberOfSignInOtpAttemptsRemaining: -1,
        userEmail: 'test@example.com',
      },
    } as unknown as GetResendAnotherAccessCodePageRequest;

    getResendAnotherAccessCodePage(req, res);

    expect(redirectMock).toHaveBeenCalledTimes(1);
    expect(redirectMock).toHaveBeenCalledWith('/not-found');
  });
});
