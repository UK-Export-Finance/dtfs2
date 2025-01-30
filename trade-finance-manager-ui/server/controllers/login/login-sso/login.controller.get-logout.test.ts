import httpMocks from 'node-mocks-http';
import { Request, Response } from 'express';
import { LoginController } from './login.controller';

describe('controllers - login (sso)', () => {
  let consoleInfoMock: jest.Mock;

  describe('getLogout', () => {
    let res: httpMocks.MockResponse<Response>;
    let req: httpMocks.MockRequest<Request>;

    beforeAll(() => {
      consoleInfoMock = jest.fn();
      console.info = consoleInfoMock;
    });

    beforeEach(() => {
      ({ req, res } = httpMocks.createMocks({
        session: { destroy: jest.fn((callback: () => void) => callback()) },
      }));
    });

    afterAll(() => {
      consoleInfoMock.mockRestore();
    });

    it('should redirect to /', () => {
      // Act
      LoginController.getLogout(req, res);

      // Assert
      expect(res._getRenderView()).toEqual('user-logged-out.njk');
    });

    it('should destroy the session', () => {
      // Act
      LoginController.getLogout(req, res);

      // Assert
      // eslint-disable-next-line @typescript-eslint/unbound-method
      expect(req.session.destroy).toHaveBeenCalledTimes(1);
    });
  });
});
