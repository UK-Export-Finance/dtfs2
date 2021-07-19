import dealsDashboard from '.';
import mockResponse from '../../helpers/responseMock';

jest.mock('../../api');
jest.mock('../../helpers', () => ({
  __esModule: true,
  getApiData: jest.fn(() => ({
    count: 2,
    deals: ['mock deal 1', 'mock deal 2'],
  })),
  getFlashSuccessMessage: jest.fn(),
  requestParams: jest.fn(() => ({ userToken: 'mock-token' })),
}));

describe('dealsDashboard', () => {
  let req;
  let res;
  beforeEach(() => {
    req = {
      body: {},
      params: { page: 1 },
      session: {
        dashboardFilters: 'mock-filters',
        user: 'mock-user',
      },
    };

    res = mockResponse();
  });

  it('renders the correct template', async () => {
    await dealsDashboard(req, res);

    expect(res.render).toHaveBeenCalledWith('dashboard/deals.njk', {
      deals: ['mock deal 1', 'mock deal 2'],
      pages: {
        totalPages: 1,
        currentPage: 1,
        totalItems: 2,
      },
      primaryNav: 'home',
      user: 'mock-user',
    });
  });
});
