const dotenv = require('dotenv');
const checkApiKey = require('../../../src/v1/middleware/headers/check-api-key');
const { mockReq, mockRes, mockNext } = require('../mocks');

dotenv.config();

const { DTFS_CENTRAL_API_KEY } = process.env;

describe('routes/middleware/headers/check-api-key', () => {
  const req = mockReq();
  const res = mockRes();
  const next = mockNext;

  describe('when x-api-key header is not provided', () => {
    it('should call res.status with 401', () => {
      req.headers = {};

      checkApiKey(req, res, next);

      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.send).toHaveBeenCalledWith('Unauthorised');
    });
  });

  describe('when x-api-key header is invalid', () => {
    it('should call res.status with 401', () => {
      req.headers = {
        'x-api-key': `${DTFS_CENTRAL_API_KEY}-invalid`,
      };

      checkApiKey(req, res, next);

      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.send).toHaveBeenCalledWith('Unauthorised');
    });
  });

  describe('when x-api-key header is valid', () => {
    it('should call next', () => {
      req.headers = {
        'x-api-key': DTFS_CENTRAL_API_KEY,
      };

      checkApiKey(req, res, next);

      expect(next).toHaveBeenCalledTimes(1);
    });
  });
});
