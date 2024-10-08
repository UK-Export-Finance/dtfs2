import { TEAM_IDS } from '@ukef/dtfs2-common';
import api from '../../api';
import loginController from '.';
import { mockReq, mockRes } from '../../test-mocks';

const req = mockReq();
const res = mockRes();

describe('controllers - login', () => {
  describe('GET', () => {
    it('should render login template', () => {
      req.session.user = {};
      loginController.getLogin(req, res);
      expect(res.render).toHaveBeenCalledWith('login.njk', { user: {} });
    });
  });

  describe('POST', () => {
    it('should render login template if login unsuccessful', async () => {
      // Arrange
      api.login = (username, password) => {
        const returnVal = username && password ? { success: true, token: '', user: {} } : false;
        return Promise.resolve(returnVal);
      };
      const postReq = {
        ...req,
        body: {},
      };

      // Act
      await loginController.postLogin(postReq, res);

      // Assert
      expect(res.render).toHaveBeenCalledWith('login.njk', {
        errors: {
          errorSummary: [
            {
              href: '#email',
              text: 'Enter an email address in the correct format, for example, name@example.com',
            },
            {
              href: '#password',
              text: 'Enter a valid password',
            },
          ],
          fieldErrors: {
            email: {
              text: 'Enter an email address in the correct format, for example, name@example.com',
            },
            password: {
              text: 'Enter a valid password',
            },
          },
        },
      });
    });

    it('should redirect to /home if login successful', async () => {
      // Arrange
      const mockUser = {
        email: 'T1_USER_1',
        password: 'AbC!2345',
        teams: [TEAM_IDS.PIM],
      };
      api.login = (username, password) => {
        const returnVal = username && password ? { success: true, token: '', user: mockUser } : false;
        return Promise.resolve(returnVal);
      };
      const postReq = {
        ...req,
        body: {
          email: mockUser.email,
          password: mockUser.password,
        },
      };

      // Act
      await loginController.postLogin(postReq, res);

      // Assert
      expect(res.redirect).toHaveBeenCalledWith('/home');
    });
  });

  describe('Logout', () => {
    it('should return to login page on logout', () => {
      const logoutReq = {
        ...req,
        session: {
          destroy: (callback) => {
            callback();
          },
        },
      };

      loginController.logout(logoutReq, res);

      expect(res.redirect).toHaveBeenCalledWith('/');
    });
  });
});
