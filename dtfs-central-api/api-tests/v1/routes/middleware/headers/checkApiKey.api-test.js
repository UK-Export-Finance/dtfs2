const dotenv = require('dotenv');
const checkApiKey = require('../../../../../src/v1/routes/middleware/headers/checkApiKey');
const { mockReq, mockRes, mockNext } = require('../../../mocks');

dotenv.config();

const { API_KEY } = process.env;

describe('checkApiKey', () => {
  const req = mockReq();
  const res = mockRes();
  const next = mockNext;

  describe('when x-api-key header is not provided', () => {
    it('should call res.status with 401', () => {
      req.headers = {};

      checkApiKey(req, res, next);

      expect(res.status).toHaveBeenCalledWith(401);
    });
  });

  describe('when x-api-key header is the correct key', () => {
    it('should call next', () => {
      req.headers = {
        'x-api-key': API_KEY,
      };

      checkApiKey(req, res, next);

      expect(next).toHaveBeenCalledTimes(1);
    });
  });

  describe('when x-api-key header is invalid', () => {
    it('should call res.status with 401', () => {
      req.headers = {
        'x-api-key': `${API_KEY}-123`,
      };

      checkApiKey(req, res, next);

      expect(res.status).toHaveBeenCalledWith(401);
    });
  });
});
