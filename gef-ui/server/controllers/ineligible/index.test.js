import ineligible from './index';

const MockResponse = () => {
  const res = {};
  res.redirect = jest.fn();
  res.render = jest.fn();
  return res;
};

const mockResponse = MockResponse();

afterEach(() => {
  jest.clearAllMocks();
});

describe('GET Mandatory Criteria', () => {
  it('renders the `ineligible` template', async () => {
    await ineligible({}, mockResponse);
    expect(mockResponse.render).toHaveBeenCalledWith('partials/ineligible.njk');
  });
});
