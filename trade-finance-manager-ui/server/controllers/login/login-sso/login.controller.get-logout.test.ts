import httpMocks from 'node-mocks-http';
import { Request, Response } from 'express';
import { LoginController } from './login.controller';

const { getLogout } = LoginController;

describe('login.controller - logout', () => {
  describe('getLogout', () => {
    let res: httpMocks.MockResponse<Response>;
    let req: httpMocks.MockRequest<Request>;

    const destroyMock: jest.Mock = jest.fn((callback: () => void) => callback());

    beforeAll(() => {
      console.info = jest.fn();
    });

    beforeEach(() => {
      jest.resetAllMocks();
    });

    describe('User is not logged-in', () => {
      beforeEach(() => {
        ({ req, res } = httpMocks.createMocks({
          session: {
            destroy: destroyMock,
          },
        }));
      });

      it('should add some logs when the user is re-directed when not logged-in into TFM', () => {
        // Act
        getLogout(req, res);

        // Assert
        expect(console.info).toHaveBeenCalledWith('Re-directing user to TFM SSO login');
        expect(console.info).toHaveBeenCalledTimes(1);
        expect(destroyMock).not.toHaveBeenCalled();
      });

      it('should redirect the user to /', () => {
        // Act
        getLogout(req, res);

        // Assert
        expect(res._getRedirectUrl()).toEqual('/');
        expect(destroyMock).not.toHaveBeenCalled();
      });
    });

    describe('User is logged-in', () => {
      beforeEach(() => {
        ({ req, res } = httpMocks.createMocks({
          session: {
            user: {
              _id: '68517461b924dcd38b853260',
            },
            destroy: destroyMock,
          },
        }));
      });

      afterAll(() => {
        jest.restoreAllMocks();
      });

      it('should add some logs when logging out the user from TFM', () => {
        // Act
        getLogout(req, res);

        // Assert
        expect(console.info).toHaveBeenCalledWith('Logging out TFM user %s', req.session.user?._id);
        expect(console.info).toHaveBeenCalledTimes(1);
        expect(destroyMock).toHaveBeenCalledTimes(1);
      });

      it('should render the user logged out page', () => {
        // Act
        getLogout(req, res);

        // Assert
        expect(destroyMock).toHaveBeenCalledWith(expect.any(Function));
      });

      it('should destroy the session', () => {
        // Act
        getLogout(req, res);

        // Assert
        expect(destroyMock).toHaveBeenCalledTimes(1);
      });
    });
  });
});
