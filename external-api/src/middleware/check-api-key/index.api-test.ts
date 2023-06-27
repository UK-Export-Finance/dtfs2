import dotenv from 'dotenv';
import { checkApiKey } from '.';
import { mockReq, mockRes, mockNext } from '../../test-mocks';

dotenv.config();

const { API_KEY } = process.env;

describe('middleware/check-api-key', () => {
  const req = mockReq();
  const res = mockRes();
  const next = mockNext;

  describe('when x-api-key header is not provided', () => {
    it('should call res.status with 400', () => {
      req.headers = {};

      checkApiKey(req, res, next);

      expect(res.status).toHaveBeenCalledWith(400);
    });
  });

  describe('when x-api-key header is invalid', () => {
    it('should call res.status with 401', () => {
      req.headers = {
        'x-api-key': `${API_KEY}-invalid`,
      };

      checkApiKey(req, res, next);

      expect(res.status).toHaveBeenCalledWith(401);
    });
  });

  describe('when x-api-key header is valid', () => {
    it('should call next', () => {
      req.headers = {
        'x-api-key': API_KEY,
      };

      checkApiKey(req, res, next);

      expect(next).toHaveBeenCalledTimes(1);
    });
  });
});
