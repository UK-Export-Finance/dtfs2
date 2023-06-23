import { whatDoYouNeedToChange } from './index';

const MockResponse = () => {
  const res = {};
  res.render = jest.fn();
  return res;
};

describe('controllers/amend-facility/what-do-you-need-to-change', () => {
  let mockResponse;

  beforeEach(() => {
    mockResponse = MockResponse();
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  describe('GET What do you need to change', () => {
    it('renders the `What do you need to Change` template', async () => {
      await whatDoYouNeedToChange({}, mockResponse);

      expect(mockResponse.render).toHaveBeenCalledWith('partials/amend-facility/what-do-you-need-to-change.njk', {});
    });

    it('redirects to `problem with service page` if there is an error', async () => {
      const mockNext = jest.fn();
      mockResponse.render.mockImplementation(() => { throw new Error('Failed to render'); });

      await whatDoYouNeedToChange({}, mockResponse, mockNext);

      expect(mockNext).toHaveBeenCalled();
    });
  });
});
