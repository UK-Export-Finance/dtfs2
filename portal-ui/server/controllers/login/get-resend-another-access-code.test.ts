import { Response } from 'express';
import { getResendAnotherAccessCodePage, GetResendAnotherAccessCodePageRequest } from './get-resend-another-access-code';

describe('getResendAnotherAccessCodePage', () => {
  let res: Response;
  let renderMock: jest.Mock;

  beforeEach(() => {
    renderMock = jest.fn();
    res = {
      render: renderMock,
    } as unknown as Response;
  });

  it('should render the resend another access code template with attemptsLeft from the session', () => {
    const req = {
      session: {
        numberOfSignInOtpAttemptsRemaining: 2,
        userEmail: 'test@example.com',
      },
    } as unknown as GetResendAnotherAccessCodePageRequest;

    getResendAnotherAccessCodePage(req, res);

    expect(renderMock).toHaveBeenCalledWith('login/resend-another-access-code.njk', {
      attemptsLeft: 2,
      requestNewCodeUrl: '/login/request-new-access-code',
      email: 'test@example.com',
    });
  });

  it('should render problem with service template when attemptsLeft is not present in the session', () => {
    const req = {
      session: {},
    } as unknown as GetResendAnotherAccessCodePageRequest;

    getResendAnotherAccessCodePage(req, res);

    expect(renderMock).toHaveBeenCalledWith('partials/problem-with-service.njk');
  });

  it('should render problem with service template when an error occurs while rendering', () => {
    const req = {
      session: {
        numberOfSignInOtpAttemptsRemaining: 1,
        userEmail: 'test@example.com',
      },
    } as unknown as GetResendAnotherAccessCodePageRequest;

    renderMock.mockImplementationOnce(() => {
      throw new Error('Render error');
    });

    getResendAnotherAccessCodePage(req, res);

    expect(renderMock).toHaveBeenNthCalledWith(2, 'partials/problem-with-service.njk');
  });
});
