import { createMocks } from 'node-mocks-http';
import { destroySessionAndRedirectToStart } from '.';

describe('Validate Token', () => {
  describe('destroySessionAndRedirectToStart', () => {
    it('destroySessionAndRedirectToStart destroys session', () => {
      // Arrange
      const session = { destroy: jest.fn() };
      const { req, res } = createMocks({ session });

      // Act
      destroySessionAndRedirectToStart(req, res);

      // Assert
      expect(session.destroy).toHaveBeenCalled();
    });

    it('destroySessionAndRedirectToStart redirects to /', () => {
      // Arrange
      const { req, res } = createMocks({ session: { destroy: jest.fn((callback) => callback()) } });

      // Act
      destroySessionAndRedirectToStart(req, res);

      // Assert
      expect(res._getRedirectUrl()).toEqual('/');
    });
  });
});
