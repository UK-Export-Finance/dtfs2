import ineligibleAutomaticCover from './index';

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

describe('GET Ineligible Automatic Cover', () => {
  it('renders the `ineligible for Automatic Cover` template with the correct paramaters', async () => {
    const mockedRequest = {
      params: {
        applicationId: '123',
      },
    };
    await ineligibleAutomaticCover(mockedRequest, response);
    expect(response.render).toHaveBeenCalledWith('partials/ineligible-automatic-cover.njk', {
      applicationId: '123',
    });
  });
});
