import eligibleAutomaticCover from './index';

const MockRequest = () => {
  const req = {};
  req.params = {};
  return req;
};

const MockResponse = () => {
  const res = {};
  res.redirect = jest.fn();
  res.render = jest.fn();
  return res;
};

afterEach(() => {
  jest.resetAllMocks();
});

describe('GET Eligible Automatic Cover', () => {
  it('renders the `eligible for Automatic Cover` template with the correct paramaters', async () => {
    const mockResponse = MockResponse();
    const mockRequest = MockRequest();
    mockRequest.params.dealId = '123';
    await eligibleAutomaticCover(mockRequest, mockResponse);
    expect(mockResponse.render).toHaveBeenCalledWith('_partials/eligible-automatic-cover.njk', {
      dealId: '123',
    });
  });
});
