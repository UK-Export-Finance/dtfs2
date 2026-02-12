import { Response } from 'express';
import { requestNewAccessCode, PostNewAccessCodePageRequest } from './post-request-new-access-code';
import * as api from '../../api';
import { getNextAccessCodePage } from '../../helpers/getNextAccessCodePage';

jest.mock('../../api');
jest.mock('../../helpers/getNextAccessCodePage');

console.error = jest.fn();

describe('requestNewAccessCode', () => {
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

    (getNextAccessCodePage as jest.Mock).mockReturnValue({ nextAccessCodePage: '/next-access-code-page' });

    await requestNewAccessCode(req, res);

    expect(api.sendSignInOTP).toHaveBeenCalledWith('test-token');
    expect(getNextAccessCodePage).toHaveBeenCalledWith(2);
    expect(redirectMock).toHaveBeenCalledWith('/next-access-code-page');
    expect(renderMock).not.toHaveBeenCalled();
  });

  it('should render problem with service template when attemptsLeft is undefined', async () => {
    const req = {
      session: {
        userToken: 'test-token',
      },
    } as unknown as PostNewAccessCodePageRequest;

    (api.sendSignInOTP as jest.Mock).mockResolvedValue({
      data: {},
    });

    await requestNewAccessCode(req, res);

    expect(api.sendSignInOTP).toHaveBeenCalledWith('test-token');
    expect(getNextAccessCodePage).not.toHaveBeenCalled();
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

    await requestNewAccessCode(req, res);

    expect(api.sendSignInOTP).toHaveBeenCalledWith('test-token');
    expect(renderMock).toHaveBeenCalledWith('partials/problem-with-service.njk');
    expect(redirectMock).not.toHaveBeenCalled();
  });
});
