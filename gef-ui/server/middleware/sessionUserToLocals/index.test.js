import sessionUserToLocals from '.';

const MockRequest = () => {
  const req = {};
  req.session = {};
  return req;
};
const MockResponse = () => {
  const res = {};
  res.locals = {};
  return res;
};
const mockNext = jest.fn();

afterEach(() => {
  jest.clearAllMocks();
});

describe('sessionUserToLocals', () => {
  it('calls next()', async () => {
    const mockRequest = MockRequest();
    const mockResponse = MockResponse();

    await sessionUserToLocals(mockRequest, mockResponse, mockNext);

    expect(mockNext).toHaveBeenCalled();
  });

  it('translates session user to res.locals user', async () => {
    const mockRequest = MockRequest();
    const mockResponse = MockResponse();
    mockRequest.session.user = { name: 'User Name' };

    await sessionUserToLocals(mockRequest, mockResponse, mockNext);
    expect(mockResponse.locals).toEqual({
      user: {
        name: 'User Name',
      },
    });
    expect(mockNext).toHaveBeenCalled();
  });
});
