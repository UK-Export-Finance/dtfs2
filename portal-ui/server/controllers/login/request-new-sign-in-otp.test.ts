import { Response } from 'express';
import { requestNewSignInOtp, PostNewAccessCodePageRequest } from './request-new-sign-in-otp';
import * as api from '../../api';
import { getNextAccessCodePage } from '../../helpers/getNextAccessCodePage';

jest.mock('../../api');
jest.mock('../../helpers/getNextAccessCodePage');

console.error = jest.fn();

describe('requestNewSignInOtp', () => {
  let res: Response;
  let redirectMock: jest.Mock;
  let renderMock: jest.Mock;

  beforeEach(() => {
    redirectMock = jest.fn();
    renderMock = jest.fn();
    res = {
      redirect: redirectMock,
      render: renderMock,
    } as unknown as Response;

    jest.clearAllMocks();
  });

  it('should redirect to the next access code page when attemptsLeft is returned', async () => {
    const req = {
      session: {
        userToken: 'test-token',
      },
    } as unknown as PostNewAccessCodePageRequest;

    (api.sendSignInOTP as jest.Mock).mockResolvedValue({
      data: { numberOfSignInOtpAttemptsRemaining: 2 },
    });

    (getNextAccessCodePage as jest.Mock).mockReturnValue({
      nextAccessCodePage: '/next-access-code-page',
    });

    await requestNewSignInOtp(req, res);

    expect(api.sendSignInOTP).toHaveBeenCalledWith('test-token');
    expect(getNextAccessCodePage).toHaveBeenCalledWith(2);
    expect(redirectMock).toHaveBeenCalledWith('/next-access-code-page');
  });

  it('should render problem with service template when attemptsLeft is not returned', async () => {
    const req = {
      session: {
        userToken: 'test-token',
      },
    } as unknown as PostNewAccessCodePageRequest;

    (api.sendSignInOTP as jest.Mock).mockResolvedValue({
      data: {},
    });

    await requestNewSignInOtp(req, res);

    expect(api.sendSignInOTP).toHaveBeenCalledWith('test-token');
    expect(renderMock).toHaveBeenCalledWith('partials/problem-with-service.njk');
    expect(redirectMock).not.toHaveBeenCalled();
  });

  it('should render problem with service template when an error occurs while requesting a new code', async () => {
    const req = {
      session: {
        userToken: 'test-token',
      },
    } as unknown as PostNewAccessCodePageRequest;

    (api.sendSignInOTP as jest.Mock).mockRejectedValue(new Error('API error'));

    await requestNewSignInOtp(req, res);

    expect(api.sendSignInOTP).toHaveBeenCalledWith('test-token');
    expect(renderMock).toHaveBeenCalledWith('partials/problem-with-service.njk');
    expect(redirectMock).not.toHaveBeenCalled();
  });
});
