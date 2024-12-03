import ineligibleGef from './index';

const MockResponse = () => {
  const res = {};
  res.redirect = jest.fn();
  res.render = jest.fn();
  return res;
};

describe('GET Mandatory Criteria', () => {
  afterEach(() => {
    jest.resetAllMocks();
  });

  it('renders the `ineligible for GEF` template', async () => {
    const mockResponse = MockResponse();
    await ineligibleGef({}, mockResponse);
    expect(mockResponse.render).toHaveBeenCalledWith('partials/ineligible-gef.njk');
  });
});
