import { createMocks } from 'node-mocks-http';
import destroySessionAndRedirectToStart from './destroy-session-and-redirect-to-start';

describe('helpers - destroySessionAndRedirectToStart', () => {
  it('helper destroys session', () => {
    // Arrange
    const session = { destroy: jest.fn() };
    const { req, res } = createMocks({ session });

    // Act
    destroySessionAndRedirectToStart(req, res);

    // Assert
    expect(session.destroy).toHaveBeenCalled();
  });

  it('helper redirects to /', () => {
    // Arrange
    const { req, res } = createMocks({ session: { destroy: jest.fn((callback) => callback()) } });

    // Act
    destroySessionAndRedirectToStart(req, res);

    // Assert
    expect(res._getRedirectUrl()).toEqual('/');
  });
});
