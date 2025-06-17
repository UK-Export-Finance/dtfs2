import httpMocks from 'node-mocks-http';
import { Request, Response } from 'express';
import { LoginController } from './login.controller';

const { getLogout } = LoginController;

describe('login.controller - logout', () => {
  describe('getLogout', () => {
    let res: httpMocks.MockResponse<Response>;
    let req: httpMocks.MockRequest<Request>;

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
            destroy: jest.fn(),
          },
        }));
      });

      it('should log user re-direction when user is not logged-in', () => {
        // Act
        getLogout(req, res);

        // Assert
        expect(console.info).toHaveBeenCalledWith('Re-directing user to TFM SSO login');
        expect(console.info).toHaveBeenCalledTimes(1);
      });

      it('should redirect the user to /', () => {
        // Act
        getLogout(req, res);

        // Assert
        expect(res._getRedirectUrl()).toEqual('/');
      });
    });

    describe('User is logged-in', () => {
      beforeEach(() => {
        ({ req, res } = httpMocks.createMocks({
          session: {
            user: {
              _id: '68517461b924dcd38b853260',
            },
            destroy: jest.fn((callback: () => void) => callback()),
          },
        }));
      });

      afterAll(() => {
        jest.restoreAllMocks();
      });

      it('should log user log-out action with user id', () => {
        // Act
        getLogout(req, res);

        // Assert
        expect(console.info).toHaveBeenCalledWith('Logging out TFM user %s', req.session.user?._id);
        expect(console.info).toHaveBeenCalledTimes(1);
      });

      it('should render the user logged out page', () => {
        // Act
        getLogout(req, res);

        // Assert
        expect(res._getRenderView()).toEqual('user-logged-out.njk');
      });

      it('should destroy the session', () => {
        // Act
        getLogout(req, res);

        // Assert
        // eslint-disable-next-line @typescript-eslint/unbound-method
        expect(req.session.destroy).toHaveBeenCalledTimes(1);
      });
    });
  });
});
