import ineligible from './index';

const mockResponse = () => {
  const res = {};
  res.redirect = jest.fn();
  res.render = jest.fn();
  return res;
};

const response = mockResponse();

afterEach(() => {
  jest.clearAllMocks();
});

describe('GET Mandatory Criteria', () => {
  it('renders the `ineligible` template', async () => {
    await ineligible({}, response);
    expect(response.render).toHaveBeenCalledWith('partials/ineligible.njk');
  });
});
