import { Response } from 'express';
import { requestNewAccessCode, GetNewAccessCodePageRequest } from './get-request-new-access-code';
import * as api from '../../api';
import { getNextAccessCodePage } from '../../helpers/getNextAccessCodePage';

jest.mock('../../api');
jest.mock('../../helpers/getNextAccessCodePage');

console.error = jest.fn();

describe('controllers/login/get-request-new-access-code', () => {
  let res: Response;
  let redirectMock: jest.Mock;
  let renderMock: jest.Mock;
  let req: GetNewAccessCodePageRequest;

  beforeEach(() => {
    redirectMock = jest.fn();
    renderMock = jest.fn();
    res = {
      redirect: redirectMock,
      render: renderMock,
    } as unknown as Response;

    req = {
      session: {
        userToken: 'test-token',
      },
    } as unknown as GetNewAccessCodePageRequest;

    jest.clearAllMocks();
  });

  describe('when numberOfSignInOtpAttemptsRemaining is 0 (third expired code)', () => {
    beforeEach(() => {
      req.session.numberOfSignInOtpAttemptsRemaining = 0;
      (api.sendSignInOTP as jest.Mock).mockResolvedValue({
        data: { numberOfSignInOtpAttemptsRemaining: -1 },
      });
      (getNextAccessCodePage as jest.Mock).mockReturnValue('/login/temporarily-suspended-access-code');
    });

    it('should call API to trigger suspension email and redirect to suspended account page', async () => {
      await requestNewAccessCode(req, res);

      expect(api.sendSignInOTP).toHaveBeenCalledWith('test-token');
      expect(req.session.numberOfSignInOtpAttemptsRemaining).toEqual(-1);
      expect(getNextAccessCodePage).toHaveBeenCalledWith(-1);
      expect(redirectMock).toHaveBeenCalledWith('/login/temporarily-suspended-access-code');
      expect(renderMock).not.toHaveBeenCalled();
    });
  });

  describe('when attemptsLeft is returned', () => {
    beforeEach(() => {
      (api.sendSignInOTP as jest.Mock).mockResolvedValue({
        data: { numberOfSignInOtpAttemptsRemaining: 2 },
      });
      (getNextAccessCodePage as jest.Mock).mockReturnValue('/next-access-code-page');
    });

    it('should redirect to the next access code page', async () => {
      await requestNewAccessCode(req, res);

      expect(api.sendSignInOTP).toHaveBeenCalledWith('test-token');
      expect(getNextAccessCodePage).toHaveBeenCalledWith(2);
      expect(redirectMock).toHaveBeenCalledWith('/next-access-code-page');
      expect(renderMock).not.toHaveBeenCalled();
    });
  });

  describe('when attemptsLeft is undefined', () => {
    beforeEach(() => {
      (api.sendSignInOTP as jest.Mock).mockResolvedValue({
        data: {},
      });
    });

    it('should render problem with service template (defensive check - should not occur with updated API)', async () => {
      await requestNewAccessCode(req, res);

      expect(api.sendSignInOTP).toHaveBeenCalledWith('test-token');
      expect(renderMock).toHaveBeenCalledWith('partials/problem-with-service.njk');
      expect(redirectMock).not.toHaveBeenCalled();
    });
  });

  describe('when an error occurs while requesting a new code', () => {
    beforeEach(() => {
      (api.sendSignInOTP as jest.Mock).mockRejectedValue(new Error('API error'));
    });

    it('should render problem with service template and log error', async () => {
      await requestNewAccessCode(req, res);

      expect(api.sendSignInOTP).toHaveBeenCalledWith('test-token');
      expect(console.error).toHaveBeenCalledWith('Error requesting new access code: %o', new Error('API error'));
      expect(renderMock).toHaveBeenCalledWith('partials/problem-with-service.njk');
      expect(redirectMock).not.toHaveBeenCalled();
    });
  });
});
