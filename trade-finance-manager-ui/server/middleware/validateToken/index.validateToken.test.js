const { validateToken, destroySessionAndRedirectToStart } = require('.');
const api = require('../../api');

jest.mock('../../api');
jest.mock('.', () => ({
  destroySessionAndRedirectToStart: jest.fn(),
  ...jest.requireActual('.'),
}));

const MockRequest = () => {
  const req = {};
  req.session = {
    destroy: jest.fn((callback) => {
      callback();
    }),
  };
  return req;
};

const MockResponse = () => {
  const res = {};
  res.redirect = jest.fn();
  return res;
};

const mockRequest = MockRequest();
const mockResponse = MockResponse();
const mockNext = jest.fn();

describe('Validate Token', () => {
  beforeEach(() => {
    jest.resetAllMocks();
    jest.mocked(destroySessionAndRedirectToStart).mockReturnValue();
  });

  describe('validateToken', () => {
    it('calls destroySessionAndRedirectToStart if a user token is not supplied', async () => {
      api.validateToken = () => Promise.resolve(true);
      await validateToken(mockRequest, mockResponse);
      expect(destroySessionAndRedirectToStart).toHaveBeenCalledWith(mockRequest, mockResponse);
    });

    it('calls destroySessionAndRedirectToStart if a user empty token is not supplied', async () => {
      mockRequest.session.userToken = '';
      api.validateToken = () => Promise.resolve(true);
      await validateToken(mockRequest, mockResponse);
      expect(destroySessionAndRedirectToStart).toHaveBeenCalledWith(mockRequest, mockResponse);
    });

    it('calls destroySessionAndRedirectToStart if a user token is supplied but validation fails', async () => {
      mockRequest.session.userToken = '1234';
      api.validateToken = () => Promise.resolve(false);
      await validateToken(mockRequest, mockResponse);
      expect(destroySessionAndRedirectToStart).toHaveBeenCalledWith(mockRequest, mockResponse);
    });

    it('calls the `next()` method if validation is successful', async () => {
      mockRequest.session.userToken = '1234';
      api.validateToken = () => Promise.resolve(true);
      await validateToken(mockRequest, mockResponse, mockNext);
      expect(mockNext).toHaveBeenCalled();
    });
  });
});
