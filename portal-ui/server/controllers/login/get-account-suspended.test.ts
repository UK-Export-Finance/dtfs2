import { Response } from 'express';
import { getAccountSuspendedPage, GetAccountSuspendedPageRequest } from './get-account-suspended';

describe('controllers/login/get-account-suspended', () => {
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

  it('should render the account suspended access code template with attemptsLeft from the session', () => {
    const req = {
      session: {
        numberOfSignInOtpAttemptsRemaining: -1,
      },
    } as unknown as GetAccountSuspendedPageRequest;

    getAccountSuspendedPage(req, res);

    expect(renderMock).toHaveBeenCalledTimes(1);
    expect(renderMock).toHaveBeenCalledWith('login/temporarily-suspended-access-code.njk');
  });

  it('should redirect to not-found when attemptsLeft is not present in the session', () => {
    const req = {
      session: {},
    } as unknown as GetAccountSuspendedPageRequest;

    getAccountSuspendedPage(req, res);

    expect(redirectMock).toHaveBeenCalledTimes(1);
    expect(redirectMock).toHaveBeenCalledWith('/not-found');
  });

  it('should redirect to not-found when attemptsLeft is positive', () => {
    const req = {
      session: {
        numberOfSignInOtpAttemptsRemaining: 2,
      },
    } as unknown as GetAccountSuspendedPageRequest;

    getAccountSuspendedPage(req, res);

    expect(redirectMock).toHaveBeenCalledTimes(1);
    expect(redirectMock).toHaveBeenCalledWith('/not-found');
  });
});
