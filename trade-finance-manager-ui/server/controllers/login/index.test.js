import loginController from '.';
import { mockReq, mockRes } from '../../test-mocks';

const req = mockReq();
const res = mockRes();

describe('controllers - login', () => {
  describe('GET', () => {
    it('should render login template', () => {
      loginController.getLogin(req, res);
      expect(res.render).toHaveBeenCalledWith('login.njk');
    });
  });

  describe('POST', () => {
    it('should redirect to /case/deal/1000676', () => {
      loginController.postLogin(req, res);
      expect(res.redirect).toHaveBeenCalledWith('/case/deal/1000676');
    });
  });
});
