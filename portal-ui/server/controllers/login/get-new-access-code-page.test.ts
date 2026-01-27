import { Response } from 'express';
import { getNewAccessCodePage, GetNewAccessCodePageRequest } from './get-new-access-code-page';

describe('getNewAccessCodePage', () => {
  let res: Response;
  let renderMock: jest.Mock;

  beforeEach(() => {
    renderMock = jest.fn();
    res = {
      render: renderMock,
    } as unknown as Response;
  });

  console.error = jest.fn();

  it('should render the new access code template with attemptsLeft from the session', () => {
    const req = {
      session: {
        numberOfSendSignInOtpAttemptsRemaining: 2,
        userEmail: 'test@example.com',
      },
    } as unknown as GetNewAccessCodePageRequest;

    getNewAccessCodePage(req, res);

    expect(renderMock).toHaveBeenCalledWith('login/new-access-code.njk', {
      attemptsLeft: 2,
      requestNewCodeUrl: '/login/request-new-access-code',
      email: 'test@example.com',
    });
  });

  it('should render problem with service template when attemptsLeft is not present in the session', () => {
    const req = {
      session: {},
    } as unknown as GetNewAccessCodePageRequest;

    getNewAccessCodePage(req, res);

    expect(renderMock).toHaveBeenCalledWith('partials/problem-with-service.njk');
  });

  it('should render problem with service template when an error occurs while rendering', () => {
    const req = {
      session: {
        numberOfSignInOtpAttemptsRemaining: 1,
      },
    } as unknown as GetNewAccessCodePageRequest;

    renderMock.mockImplementationOnce(() => {
      throw new Error('Render error');
    });

    getNewAccessCodePage(req, res);

    expect(renderMock).toHaveBeenNthCalledWith(2, 'partials/problem-with-service.njk');
  });
});
