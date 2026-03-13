import { Response } from 'express';
import { getAccessCodeExpiredPage, GetAccessCodeExpiredPageRequest } from './get-access-code-expired-page';

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
    expect(res.render).toHaveBeenCalledWith('login/access-code-expired.njk', expect.objectContaining({ attemptsLeft: 3 }));
  });

  it('should pass correct attemptsLeft value for 2 attempts', () => {
    // Arrange
    req.session.numberOfSignInOtpAttemptsRemaining = 2;

    // Act
    getAccessCodeExpiredPage(req, res as Response);

    // Assert
    expect(res.render).toHaveBeenCalledWith('login/access-code-expired.njk', expect.objectContaining({ attemptsLeft: 2 }));
  });

  it('should handle 1 attempt remaining', () => {
    // Arrange
    req.session.numberOfSignInOtpAttemptsRemaining = 1;

    // Act
    getAccessCodeExpiredPage(req, res as Response);

    // Assert
    expect(res.render).toHaveBeenCalledWith('login/access-code-expired.njk', expect.objectContaining({ attemptsLeft: 1 }));
  });

  it('should render problem with service page when attemptsLeft is undefined', () => {
    // Arrange
    req.session.numberOfSignInOtpAttemptsRemaining = undefined;

    // Act
    getAccessCodeExpiredPage(req, res as Response);

    // Assert
    expect(res.render).toHaveBeenCalledTimes(1);
    expect(res.render).toHaveBeenCalledWith('partials/problem-with-service.njk');
    expect(res.status).not.toHaveBeenCalled();
  });

  it('should render problem with service page when an unexpected error is thrown', () => {
    // Arrange
    const renderMock = res.render as jest.Mock;
    renderMock.mockImplementationOnce(() => {
      throw new Error('Render error');
    });

    // Act
    getAccessCodeExpiredPage(req, res as Response);

    // Assert
    expect(renderMock).toHaveBeenCalledTimes(2);
    expect(renderMock).toHaveBeenNthCalledWith(1, 'login/access-code-expired.njk', expect.objectContaining({ attemptsLeft: 3 }));
    expect(renderMock).toHaveBeenNthCalledWith(2, 'partials/problem-with-service.njk');
  });
});
