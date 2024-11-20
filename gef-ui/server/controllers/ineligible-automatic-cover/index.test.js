import ineligibleAutomaticCover from './index';

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

describe('GET Ineligible Automatic Cover', () => {
  afterEach(() => {
    jest.resetAllMocks();
  });

  it('renders the `ineligible for Automatic Cover` template with the correct paramaters', async () => {
    const mockResponse = MockResponse();
    const mockRequest = MockRequest();

    mockRequest.params.dealId = '123';

    await ineligibleAutomaticCover(mockRequest, mockResponse);

    expect(mockResponse.render).toHaveBeenCalledWith('partials/ineligible-automatic-cover.njk', {
      dealId: '123',
    });
  });
});
