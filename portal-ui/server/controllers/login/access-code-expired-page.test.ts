import { Response } from 'express';
import { HttpStatusCode } from 'axios';
import { getAccessCodeExpiredPage, GetAccessCodeExpiredPageRequest } from './access-code-expired-page';

describe('getAccessCodeExpiredPage', () => {
  let req: GetAccessCodeExpiredPageRequest;
  let res: Partial<Response>;

  beforeEach(() => {
    jest.resetAllMocks();
    req = {
      session: {
        numberOfSignInOtpAttemptsRemaining: 3,
      },
    } as GetAccessCodeExpiredPageRequest;
    res = {
      status: jest.fn().mockReturnThis(),
      render: jest.fn(),
    } as Partial<Response>;
  });

  it('should render the access code expired template with attemptsLeft', () => {
    // Act
    getAccessCodeExpiredPage(req, res as Response);

    // Assert
    expect(res.status).toHaveBeenCalledWith(HttpStatusCode.Ok);
    expect(res.render).toHaveBeenCalledWith('login/access-code-expired.njk', expect.objectContaining({ attemptsLeft: 3 }));
  });

  it('should pass correct attemptsLeft value for 2 attempts', () => {
    // Arrange
    req.session.numberOfSignInOtpAttemptsRemaining = 2;

    // Act
    getAccessCodeExpiredPage(req, res as Response);

    // Assert
    expect(res.status).toHaveBeenCalledWith(HttpStatusCode.Ok);
    expect(res.render).toHaveBeenCalledWith('login/access-code-expired.njk', expect.objectContaining({ attemptsLeft: 2 }));
  });

  it('should handle 1 attempt remaining', () => {
    // Arrange
    req.session.numberOfSignInOtpAttemptsRemaining = 1;

    // Act
    getAccessCodeExpiredPage(req, res as Response);

    // Assert
    expect(res.status).toHaveBeenCalledWith(HttpStatusCode.Ok);
    expect(res.render).toHaveBeenCalledWith('login/access-code-expired.njk', expect.objectContaining({ attemptsLeft: 1 }));
  });

  it('should handle errors thrown during rendering', () => {
    // Arrange
    req.session.numberOfSignInOtpAttemptsRemaining = 2;

    const renderMock = res.render as unknown as jest.Mock;
    renderMock.mockImplementationOnce(() => {
      throw new Error('Render error');
    });

    // Act
    getAccessCodeExpiredPage(req, res as Response);

    // Assert
    expect(res.status).toHaveBeenCalledWith(HttpStatusCode.InternalServerError);
    expect(renderMock).toHaveBeenNthCalledWith(1, 'login/access-code-expired.njk', expect.objectContaining({ attemptsLeft: 2 }));
    expect(renderMock).toHaveBeenNthCalledWith(2, 'partials/problem-with-service.njk');
  });
});
