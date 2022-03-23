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
    beforeEach(() => {
      api.login = async (username) => {
        const returnVal = username ? { username } : false;
        return Promise.resolve(returnVal);
      };
    });

    it('should render login template if login unsuccessful', async () => {
      const postReq = {
        ...req,
        body: {},
      };
      await loginController.postLogin(postReq, res);
      expect(res.render).toHaveBeenCalledWith('login.njk');
    });

    it('should redirect to /deals if login successful', async () => {
      const postReq = {
        ...req,
        body: {
          email: 'test1',
          password: '12345',
        },
      };
      await loginController.postLogin(postReq, res);
      expect(res.redirect).toHaveBeenCalledWith('/deals');
    });
  });

  describe('Logout', () => {
    it('should return to login page on logout', () => {
      const logoutReq = {
        ...req,
        session: {
          destroy: (callback) => { callback(); },
        },
      };

      loginController.logout(logoutReq, res);

      expect(res.redirect).toHaveBeenCalledWith('/');
    });
  });
});
