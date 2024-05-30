const validateToken = require('.');
const api = require('../../services/api');

jest.mock('../../services/api');

const MockRequest = () => {
  const req = {};
  req.session = {
    destroy: jest.fn((f) => {
      f();
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
  it('redirects to `/` if user token is not supplied', async () => {
    mockRequest.session.userToken = '';
    api.validateToken = () => Promise.resolve(true);
    await validateToken(mockRequest, mockResponse);
    expect(mockResponse.redirect).toHaveBeenCalledWith('/');
  });

  it('redirects to `/` if user token is supplied but validation fails', async () => {
    mockRequest.session.userToken = '1234';
    api.validateToken = () => Promise.resolve(false);
    await validateToken(mockRequest, mockResponse);
    expect(mockResponse.redirect).toHaveBeenCalledWith('/');
  });

  it('calls the `next()` method if validation is successful', async () => {
    mockRequest.session.userToken = '1234';
    api.validateToken = () => Promise.resolve(true);
    await validateToken(mockRequest, mockResponse, mockNext);
    expect(mockNext).toHaveBeenCalled();
  });
});
